import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useAuth } from "../context/AuthContext";
import { sendChat, uploadFile } from "../lib/api";
import { colors } from "../lib/theme";
import type { Message, Citation } from "../lib/types";

function CitationCard({ citation, index }: { citation: Citation; index: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <TouchableOpacity
      style={styles.citationCard}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
    >
      <View style={styles.citationRow}>
        <View style={styles.citationBadge}>
          <Text style={styles.citationBadgeText}>{index + 1}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.citationTitle}>{citation.title}</Text>
          <Text style={styles.citationMeta}>
            {citation.journal} ({citation.year})
          </Text>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                `https://pubmed.ncbi.nlm.nih.gov/${citation.pmid}/`
              )
            }
          >
            <Text style={styles.citationPmid}>PMID: {citation.pmid}</Text>
          </TouchableOpacity>
          {expanded && citation.abstract ? (
            <Text style={styles.citationAbstract}>{citation.abstract}</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ChatScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileText, setFileText] = useState("");
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const userId = user?.id || "demo-marcus-chen";

  const scrollToEnd = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages, loading]);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "text/plain"],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      if (file.size && file.size > 10 * 1024 * 1024) {
        Alert.alert("File too large", "Max file size is 10 MB");
        return;
      }
      try {
        const data = await uploadFile(file.uri, file.name);
        setFileText(data.text);
        setAttachedFile(file.name);
      } catch {
        Alert.alert("Upload failed", "Could not upload file to server");
      }
    } catch {
      // cancelled
    }
  };

  const clearFile = () => {
    setFileText("");
    setAttachedFile(null);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      role: "user",
      content: text,
      fileName: attachedFile || undefined,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const data = await sendChat(text, userId, fileText || undefined);
      clearFile();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response || "Something went wrong.",
          citations: data.citations || [],
          is_emergency: data.is_emergency || false,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Unable to connect to the server. Make sure the backend is running on port 8000.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item, index: i }: { item: Message; index: number }) => (
    <View key={i} style={styles.messageWrapper}>
      <View
        style={[
          styles.messageBubble,
          item.role === "user"
            ? styles.userBubble
            : item.is_emergency
            ? styles.emergencyBubble
            : styles.assistantBubble,
          item.role === "user" ? { alignSelf: "flex-end" } : { alignSelf: "flex-start" },
        ]}
      >
        {item.fileName && (
          <View style={styles.fileChipInline}>
            <Text style={styles.fileChipText}>{item.fileName}</Text>
          </View>
        )}
        <Text
          style={[
            styles.messageText,
            item.is_emergency && { color: "#fecaca" },
          ]}
        >
          {item.content}
        </Text>
      </View>
      {item.citations && item.citations.length > 0 && (
        <View style={styles.citationsContainer}>
          <Text style={styles.sourcesLabel}>SOURCES</Text>
          {item.citations.map((cite, j) => (
            <CitationCard key={cite.pmid || j} citation={cite} index={j} />
          ))}
        </View>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Ask anything about your health</Text>
      <Text style={styles.emptySubtitle}>
        Try: "What does my LDL of 158 mean?" or attach a photo of your lab
        results
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={[
          styles.messagesList,
          messages.length === 0 && { flex: 1 },
        ]}
        ListEmptyComponent={renderEmpty}
        onContentSizeChange={scrollToEnd}
      />

      {loading && (
        <View style={styles.typingRow}>
          <ActivityIndicator size="small" color={colors.teal} />
          <Text style={styles.typingText}>Researching...</Text>
        </View>
      )}

      {/* Attached file chip */}
      {attachedFile && (
        <View style={styles.attachedChip}>
          <Text style={styles.attachedChipText} numberOfLines={1}>
            {attachedFile}
          </Text>
          <TouchableOpacity onPress={clearFile}>
            <Text style={styles.attachedChipX}>x</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TouchableOpacity onPress={pickFile} style={styles.attachButton}>
          <Text style={{ color: attachedFile ? colors.teal : colors.textMuted, fontSize: 22 }}>
            +
          </Text>
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          placeholder={
            attachedFile
              ? "Ask about your document..."
              : "Ask about health, labs, meds..."
          }
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          editable={!loading}
          multiline
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={loading || !input.trim()}
          style={[
            styles.sendButton,
            (!input.trim() || loading) && styles.sendButtonDisabled,
          ]}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimer}>
        Pulse.ai is not a substitute for professional medical advice
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  messagesList: { paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  messageWrapper: { gap: 8 },
  messageBubble: {
    maxWidth: "85%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: { backgroundColor: "rgba(13, 148, 136, 0.8)" },
  assistantBubble: { backgroundColor: "rgba(30, 41, 59, 0.5)" },
  emergencyBubble: {
    backgroundColor: colors.redBg,
    borderWidth: 1,
    borderColor: colors.redBorder,
  },
  messageText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  fileChipInline: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 6,
    alignSelf: "flex-start",
  },
  fileChipText: { fontSize: 11, color: colors.text },
  citationsContainer: { paddingLeft: 4, gap: 6 },
  sourcesLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textMuted,
    letterSpacing: 1.5,
  },
  citationCard: {
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
  },
  citationRow: { flexDirection: "row", gap: 8 },
  citationBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  citationBadgeText: { fontSize: 10, fontWeight: "800", color: colors.white },
  citationTitle: { fontSize: 12, fontWeight: "600", color: colors.text },
  citationMeta: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  citationPmid: { fontSize: 10, color: colors.teal, marginTop: 2 },
  citationAbstract: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 6,
  },
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  typingText: { fontSize: 12, color: colors.textMuted },
  attachedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 4,
    backgroundColor: "rgba(20, 184, 166, 0.15)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  attachedChipText: { fontSize: 12, color: colors.teal, maxWidth: 200 },
  attachedChipX: { fontSize: 16, color: colors.textMuted },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
    backgroundColor: "rgba(30, 41, 59, 0.4)",
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.4)",
    borderRadius: 14,
    paddingHorizontal: 6,
  },
  attachButton: { padding: 8 },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 14,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.teal,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  sendButtonDisabled: { backgroundColor: "rgba(51, 65, 85, 0.6)" },
  sendButtonText: { color: colors.white, fontSize: 13, fontWeight: "600" },
  disclaimer: {
    textAlign: "center",
    fontSize: 10,
    color: colors.textDim,
    paddingVertical: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.white,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
