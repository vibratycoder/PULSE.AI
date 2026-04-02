import React from "react";
import { StatusBar, View, Text, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { colors } from "./src/lib/theme";

import LoginScreen from "./src/screens/LoginScreen";
import SignupScreen from "./src/screens/SignupScreen";
import ChatScreen from "./src/screens/ChatScreen";
import BloodWorkScreen from "./src/screens/BloodWorkScreen";
import MedTrackerScreen from "./src/screens/MedTrackerScreen";
import VaccinesScreen from "./src/screens/VaccinesScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import HealthScreen from "./src/screens/HealthScreen";
import WhoopScreen from "./src/screens/WhoopScreen";
import GarminScreen from "./src/screens/GarminScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Research: "\uD83D\uDCAC",
    Health: "\u2764\uFE0F",
    WHOOP: "\u231A",
    Garmin: "\uD83C\uDFC3",
    "Blood Work": "\uD83E\uDE78",
    Meds: "\uD83D\uDC8A",
    Vaccines: "\uD83D\uDC89",
    Profile: "\uD83D\uDC64",
  };
  return (
    <View style={{ alignItems: "center", width: 56 }}>
      <Text style={{ fontSize: 22 }}>{icons[label] || "\u2022"}</Text>
      <Text
        style={{
          fontSize: 9,
          color: focused ? colors.teal : colors.textMuted,
          marginTop: 3,
          fontWeight: focused ? "700" : "400",
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: "600", fontSize: 17 },
        tabBarStyle: {
          backgroundColor: colors.bgCard,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 90,
          paddingBottom: 16,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.teal,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen
        name="Research"
        component={ChatScreen}
        options={{
          headerTitle: "Pulse.ai",
          headerTitleStyle: {
            fontWeight: "800",
            fontSize: 20,
            color: colors.teal,
          },
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Research" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Health"
        component={HealthScreen}
        options={{
          headerTitle: "Health",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Health" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="WHOOP"
        component={WhoopScreen}
        options={{
          headerTitle: "WHOOP",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="WHOOP" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Garmin"
        component={GarminScreen}
        options={{
          headerTitle: "Garmin",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Garmin" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="BloodWork"
        component={BloodWorkScreen}
        options={{
          headerTitle: "Blood Work",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Blood Work" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="MedTracker"
        component={MedTrackerScreen}
        options={{
          headerTitle: "Med Tracker",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Meds" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Vaccines"
        component={VaccinesScreen}
        options={{
          headerTitle: "Vaccines",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Vaccines" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerTitle: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Profile" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.teal} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
