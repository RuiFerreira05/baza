import { useBasicModalStyles } from "@/constants/styles/useBasicModalStyles";
import { useAppTheme } from "@/hooks/useAppTheme";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";

interface BasicModalProps {
  modalText: string;
  actionText: string;
  modalVisible: boolean;
  onBackPress: () => void;
  onActionPress: () => void;
  onCancelPress: () => void;
  onRequestClose: () => void;
  isLoading: boolean;
}

export default function BasicModal({
  modalText,
  actionText,
  modalVisible,
  onBackPress,
  onActionPress,
  onCancelPress,
  onRequestClose,
  isLoading = false,
}: BasicModalProps) {
  const styles = useBasicModalStyles();
  const { colors } = useAppTheme();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={onRequestClose}
    >
      <Pressable
        onPress={onBackPress}
        style={[styles.overlay, { backgroundColor: "rgba(0, 0, 0, 0.4)" }]}
      >
        {isLoading && <ActivityIndicator size={70} color={colors.primary} />}
        {!isLoading && (
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={styles.subTitle}>{modalText}</Text>

            <View style={styles.row}>
              <Pressable
                onPress={onActionPress}
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={{ color: colors.onPrimary }}>{actionText}</Text>
              </Pressable>

              <Pressable
                onPress={onCancelPress}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={{ color: colors.primary }}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        )}
      </Pressable>
    </Modal>
  );
}
