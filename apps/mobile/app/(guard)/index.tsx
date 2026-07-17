import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Screen, Text, Button } from "@repo/ui";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../src/features/auth/hooks/useAuth";
import { UserCheck } from "lucide-react-native";

export default function GuardDashboardPlaceholder() {
  const { logout, user } = useAuth();

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <LinearGradient
        colors={["#E8F5E9", "#F4F7F4", "#FAF8F5"]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <Screen className="flex-1 bg-transparent justify-center items-center px-6">
        <View style={styles.card}>
          <View style={styles.iconWrapper}>
            <UserCheck size={36} color="#FFFFFF" />
          </View>
          <Text variant="h2" className="font-bold text-[#11111E] text-center mt-6">
            Guard Portal
          </Text>
          <Text style={styles.welcomeText}>
            Welcome, {user?.name || "Guard"}!
          </Text>
          <Text style={styles.description}>
            The security guard dashboard is under construction. Soon you will be able to search residents, scan guest passes, and log visitor entries/exits.
          </Text>
          
          <Button 
            title="Log Out" 
            variant="outline" 
            onPress={logout} 
            className="w-full mt-6"
          />
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.55)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 32,
    padding: 32,
    alignItems: "center",
    shadowColor: "#71717A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
    width: "100%",
    maxWidth: 340,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#2E7D32",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  welcomeText: {
    fontSize: 15,
    fontFamily: "InterMedium",
    color: "#2E7D32",
    marginTop: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 13,
    color: "#5E5D6A",
    fontFamily: "Inter",
    lineHeight: 18,
    textAlign: "center",
    marginTop: 12,
  },
});
