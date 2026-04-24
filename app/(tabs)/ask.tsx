import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fonts } from '../../constants/fonts';
import { GROQ_CHAT_API_KEY, GROQ_MODEL } from '../../constants/chatbot';
import { ChatMessage, sendChatRequest } from '../../services/chatbotApi';

export default function AskScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const aiConfigured = !!GROQ_CHAT_API_KEY;

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending || !aiConfigured) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];

    setMessages(newMessages);
    setInput('');
    setIsSending(true);

    try {
      const assistantReply = await sendChatRequest(newMessages);
      setMessages([...newMessages, { role: 'assistant', content: assistantReply }]);
    } catch (error: any) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: error?.message ?? 'Sorry, something went wrong while contacting the assistant.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Ask a Question</Text>
          <Text style={styles.subtitle}>Get help about the app, Quran reading, or general questions.</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, aiConfigured ? styles.statusBadgeReady : styles.statusBadgeMissing]}>
              <Text style={[styles.statusBadgeText, aiConfigured ? styles.statusBadgeTextReady : styles.statusBadgeTextMissing]}>
                {aiConfigured ? `Model: ${GROQ_MODEL}` : 'AI not configured'}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No questions yet</Text>
              <Text style={styles.emptyText}>
                {aiConfigured
                  ? 'Type your question below to start a conversation with the assistant.'
                  : 'Add your Groq API key in .env, restart Expo, and the model will appear here.'}
              </Text>
            </View>
          )}

          {messages.map((msg, index) => (
            <View
              key={index}
              style={[styles.messageBubble, msg.role === 'user' ? styles.messageUser : styles.messageAssistant]}
            >
              <Text
                style={[
                  styles.messageText,
                  msg.role === 'user' ? styles.messageTextUser : styles.messageTextAssistant,
                ]}
              >
                {msg.content}
              </Text>
            </View>
          ))}

          {isSending && (
            <View style={styles.typingRow}>
              <ActivityIndicator size="small" color="#0F6A4C" />
              <Text style={styles.typingText}>Assistant is typing...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={aiConfigured ? 'Ask anything...' : 'Add API key to enable AI'}
            placeholderTextColor="#9CA3AF"
            value={input}
            onChangeText={setInput}
            multiline
            editable={aiConfigured}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || isSending || !aiConfigured) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || isSending || !aiConfigured}
          >
            {isSending ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.sendButtonText}>Send</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    color: '#0F3A2B',
    fontFamily: fonts.bold,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#6B7280',
    fontFamily: fonts.regular,
  },
  statusRow: {
    marginTop: 10,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusBadgeReady: {
    backgroundColor: '#E8F7EE',
  },
  statusBadgeMissing: {
    backgroundColor: '#FEF3F2',
  },
  statusBadgeText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },
  statusBadgeTextReady: {
    color: '#0F6A4C',
  },
  statusBadgeTextMissing: {
    color: '#B42318',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emptyState: {
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#111827',
    fontFamily: fonts.semiBold,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: fonts.regular,
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  messageUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#0F6A4C',
  },
  messageAssistant: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextUser: {
    color: '#FFFFFF',
    fontFamily: fonts.medium,
  },
  messageTextAssistant: {
    color: '#111827',
    fontFamily: fonts.regular,
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  typingText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: fonts.regular,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    maxHeight: 120,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
    fontFamily: fonts.regular,
  },
  sendButton: {
    marginLeft: 8,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0F6A4C',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
});
