"""Local evidence cache — stores retrieved papers in SQLite for reuse.

Papers are cached by query and by DOI/PMID so repeated questions or
overlapping topics don't require redundant API calls. The cache also
serves as a local knowledge base that grows over time.
"""

import json
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path

import structlog

from backend.evidence.sources.base import RawPaper

log = structlog.get_logger()

DB_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "evidence_cache.db"


def _ensure_db() -> sqlite3.Connection:
    """Create the cache database and tables if they don't exist.

    Returns:
        A sqlite3 Connection to the cache database.
    """
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")

    conn.executescript("""
        CREATE TABLE IF NOT EXISTS papers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source TEXT NOT NULL,
            external_id TEXT NOT NULL,
            doi TEXT DEFAULT '',
            title TEXT NOT NULL,
            authors TEXT DEFAULT '[]',
            journal TEXT DEFAULT '',
            year TEXT DEFAULT '',
            abstract TEXT DEFAULT '',
            url TEXT DEFAULT '',
            credibility_score REAL DEFAULT 0.5,
            citation_count INTEGER DEFAULT 0,
            is_open_access INTEGER DEFAULT 0,
            cached_at TEXT NOT NULL,
            UNIQUE(source, external_id)
        );

        CREATE TABLE IF NOT EXISTS query_cache (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            query_hash TEXT NOT NULL,
            query_text TEXT NOT NULL,
            paper_ids TEXT NOT NULL,
            cached_at TEXT NOT NULL,
            UNIQUE(query_hash)
        );

        CREATE INDEX IF NOT EXISTS idx_papers_doi ON papers(doi);
        CREATE INDEX IF NOT EXISTS idx_papers_external_id ON papers(external_id);
        CREATE INDEX IF NOT EXISTS idx_query_cache_hash ON query_cache(query_hash);
    """)
    conn.commit()
    return conn


def _query_hash(query: str) -> str:
    """Create a normalized hash key for a query string.

    Args:
        query: The search query.

    Returns:
        Normalized query string for use as a cache key.
    """
    return " ".join(sorted(query.lower().split()))


def get_cached_results(query: str, max_age_hours: int = 24) -> list[RawPaper] | None:
    """Retrieve cached papers for a query if fresh enough.

    Args:
        query: The search query.
        max_age_hours: Maximum age in hours before cache is stale.

    Returns:
        List of RawPaper if cache hit, None if cache miss.
    """
    conn = _ensure_db()
    try:
        qhash = _query_hash(query)
        cutoff = (datetime.utcnow() - timedelta(hours=max_age_hours)).isoformat()

        row = conn.execute(
            "SELECT paper_ids, cached_at FROM query_cache "
            "WHERE query_hash = ? AND cached_at > ?",
            (qhash, cutoff),
        ).fetchone()

        if not row:
            return None

        paper_ids = json.loads(row["paper_ids"])
        if not paper_ids:
            return None

        placeholders = ",".join("?" for _ in paper_ids)
        paper_rows = conn.execute(
            f"SELECT * FROM papers WHERE id IN ({placeholders})",
            paper_ids,
        ).fetchall()

        papers = [_row_to_paper(r) for r in paper_rows]
        log.info("cache_hit", query=query, papers=len(papers))
        return papers
    finally:
        conn.close()


def store_results(query: str, papers: list[RawPaper]) -> None:
    """Store papers and query mapping in the cache.

    Args:
        query: The search query that produced these results.
        papers: List of RawPaper objects to cache.
    """
    conn = _ensure_db()
    try:
        now = datetime.utcnow().isoformat()
        paper_ids: list[int] = []

        for paper in papers:
            cursor = conn.execute(
                """INSERT INTO papers
                   (source, external_id, doi, title, authors, journal, year,
                    abstract, url, credibility_score, citation_count,
                    is_open_access, cached_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                   ON CONFLICT(source, external_id) DO UPDATE SET
                     citation_count = excluded.citation_count,
                     cached_at = excluded.cached_at
                """,
                (
                    paper.source,
                    paper.external_id,
                    paper.doi,
                    paper.title,
                    json.dumps(paper.authors),
                    paper.journal,
                    paper.year,
                    paper.abstract,
                    paper.url,
                    paper.credibility_score,
                    paper.citation_count,
                    1 if paper.is_open_access else 0,
                    now,
                ),
            )
            # Get the row id (either inserted or existing)
            if cursor.lastrowid:
                paper_ids.append(cursor.lastrowid)
            else:
                existing = conn.execute(
                    "SELECT id FROM papers WHERE source = ? AND external_id = ?",
                    (paper.source, paper.external_id),
                ).fetchone()
                if existing:
                    paper_ids.append(existing["id"])

        qhash = _query_hash(query)
        conn.execute(
            """INSERT INTO query_cache (query_hash, query_text, paper_ids, cached_at)
               VALUES (?, ?, ?, ?)
               ON CONFLICT(query_hash) DO UPDATE SET
                 paper_ids = excluded.paper_ids,
                 cached_at = excluded.cached_at
            """,
            (qhash, query, json.dumps(paper_ids), now),
        )
        conn.commit()
        log.info("cache_store", query=query, papers=len(papers))
    finally:
        conn.close()


def get_cache_stats() -> dict:
    """Get cache statistics.

    Returns:
        Dict with total_papers, total_queries, and db_size_mb.
    """
    conn = _ensure_db()
    try:
        papers_count = conn.execute("SELECT COUNT(*) FROM papers").fetchone()[0]
        queries_count = conn.execute("SELECT COUNT(*) FROM query_cache").fetchone()[0]
        db_size = DB_PATH.stat().st_size / (1024 * 1024) if DB_PATH.exists() else 0
        return {
            "total_papers": papers_count,
            "total_queries": queries_count,
            "db_size_mb": round(db_size, 2),
        }
    finally:
        conn.close()


def _row_to_paper(row: sqlite3.Row) -> RawPaper:
    """Convert a database row to a RawPaper object.

    Args:
        row: A sqlite3.Row from the papers table.

    Returns:
        RawPaper reconstructed from the cached data.
    """
    return RawPaper(
        source=row["source"],
        external_id=row["external_id"],
        doi=row["doi"],
        title=row["title"],
        authors=json.loads(row["authors"]),
        journal=row["journal"],
        year=row["year"],
        abstract=row["abstract"],
        url=row["url"],
        credibility_score=row["credibility_score"],
        citation_count=row["citation_count"],
        is_open_access=bool(row["is_open_access"]),
    )
