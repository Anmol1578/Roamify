import React from "react";
import { View } from "react-native";
import { GoogleIcon } from "../social-icons";

export function GoogleMark() {
  return (
    <View style={{ width: 22, height: 22, alignItems: "center", justifyContent: "center" }}>
      <GoogleIcon size={20} />
    </View>
  );
}
