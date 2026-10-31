import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { subscribeToHalakatDialog, type HalakatDialogConfig } from '../services/dialogService';
import { fonts } from '../constants/fonts';

export function HalakatDialogHost() {
  const [dialog, setDialog] = useState<HalakatDialogConfig | null>(null);

  useEffect(() => subscribeToHalakatDialog(setDialog), []);

  if (!dialog) return null;

  const close = () => setDialog(null);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.accent} />
          <Text style={styles.title}>{dialog.title}</Text>
          {!!dialog.message && <Text style={styles.message}>{dialog.message}</Text>}
          <View style={styles.actions}>
            {dialog.buttons?.map((button, index) => (
              <Pressable
                key={`${button.text}-${index}`}
                style={[
                  styles.button,
                  button.style === 'cancel' && styles.cancelButton,
                  button.style === 'destructive' && styles.destructiveButton,
                ]}
                onPress={async () => {
                  close();
                  await button.onPress?.();
                }}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.style === 'cancel' && styles.cancelButtonText,
                    button.style === 'destructive' && styles.destructiveButtonText,
                  ]}
                >
                  {button.text}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(4, 35, 25, 0.58)',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    overflow: 'hidden',
    borderRadius: 24,
    padding: 22,
    backgroundColor: '#FFFFFF',
    shadowColor: '#041F16',
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  accent: {
    width: 46,
    height: 5,
    marginBottom: 18,
    borderRadius: 3,
    backgroundColor: '#0F6A4C',
  },
  title: {
    color: '#0B4132',
    fontSize: 20,
    fontFamily: fonts.semiBold,
  },
  message: {
    marginTop: 10,
    color: '#596B63',
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fonts.regular,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 22,
  },
  button: {
    minWidth: 76,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#0F6A4C',
  },
  cancelButton: {
    backgroundColor: '#EAF4EF',
  },
  destructiveButton: {
    backgroundColor: '#B42318',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
  cancelButtonText: {
    color: '#0F6A4C',
  },
  destructiveButtonText: {
    color: '#FFFFFF',
  },
});
