import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import LabeledInput from "@/components/LabeledInput";
import { useCreateGroupStyles } from "@/constants/styles/useCreateGroupStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useCreateGroupViewModel } from "@/viewmodels/useCreateGroupViewModel";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

type CreateGroupModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function CreateGroupModal({
  visible,
  onClose,
  onSuccess,
}: CreateGroupModalProps) {
  const { colors } = useAppTheme();
  const formStyles = useCreateGroupStyles();

  const formVm = useCreateGroupViewModel({
    onSuccess,
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <View style={formStyles.modalContainer}>
          {/* Backdrop Dismiss trigger */}
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

          <View style={formStyles.modalContent}>
            {/* Sheet Header */}
            <View style={formStyles.modalHeader}>
              <Text style={formStyles.modalTitle} numberOfLines={1}>
                Create New Group
              </Text>
              <Pressable
                style={formStyles.closeButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                onPress={onClose}
              >
                <Ionicons
                  name="close"
                  size={18}
                  color={colors.onSurfaceVariant}
                />
              </Pressable>
            </View>

            {/* Form Body */}
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <LabeledInput
                label="Group Name *"
                value={formVm.groupName}
                onChangeText={(text) => {
                  formVm.setGroupName(text);
                  if (formVm.error) formVm.setError(null);
                }}
                placeholder="e.g. Work_Squad or my.group"
                autoCapitalize="none"
                isCorrect={formVm.isGroupNameValid}
              />

              {/* Error Message */}
              {formVm.error && (
                <Text
                  style={{
                    color: colors.error,
                    fontSize: 13,
                    fontFamily: "Inter_500Medium",
                    marginTop: 4,
                  }}
                >
                  {formVm.error}
                </Text>
              )}

              {/* Modal action Buttons row */}
              <View style={formStyles.buttonRow}>
                <Pressable style={formStyles.cancelButton} onPress={onClose}>
                  <Text style={formStyles.cancelButtonText}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={[
                    formStyles.submitButton,
                    (!formVm.isGroupNameValid || formVm.isCreating) &&
                      formStyles.disabledButton,
                  ]}
                  disabled={!formVm.isGroupNameValid || formVm.isCreating}
                  onPress={formVm.handleCreateGroup}
                >
                  {formVm.isCreating ? (
                    <ActivityIndicator size="small" color={colors.onPrimary} />
                  ) : (
                    <Text style={formStyles.submitButtonText}>
                      Create Group
                    </Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
