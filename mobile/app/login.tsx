import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';

const ORANGE = '#E8541E';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  async function sendOtp() {
    if (!phone || phone.length < 10) return Alert.alert('Enter a valid phone number');
    setLoading(true);
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
    setLoading(false);
    if (error) return Alert.alert('Error', error.message);
    setStep('otp');
  }

  async function verifyOtp() {
    if (!otp || otp.length < 4) return Alert.alert('Enter the OTP');
    setLoading(true);
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    const { error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: otp,
      type: 'sms',
    });
    setLoading(false);
    if (error) return Alert.alert('Invalid OTP', error.message);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.logo}>The Narad</Text>
      <Text style={styles.tagline}>Real News Reaches Real People</Text>

      {step === 'phone' ? (
        <>
          <Text style={styles.label}>Enter your phone number</Text>
          <TextInput
            style={styles.input}
            placeholder="+91 9876543210"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={13}
          />
          <TouchableOpacity style={styles.btn} onPress={sendOtp} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send OTP</Text>}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.label}>Enter the OTP sent to {phone}</Text>
          <TextInput
            style={styles.input}
            placeholder="6-digit OTP"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
            maxLength={6}
          />
          <TouchableOpacity style={styles.btn} onPress={verifyOtp} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify & Login</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStep('phone')}>
            <Text style={styles.back}>Change number</Text>
          </TouchableOpacity>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', padding: 28 },
  logo: { fontSize: 36, fontWeight: '800', color: ORANGE, textAlign: 'center', marginBottom: 6 },
  tagline: { fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 48 },
  label: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 10 },
  input: {
    borderWidth: 1.5, borderColor: '#ddd', borderRadius: 10,
    padding: 14, fontSize: 16, marginBottom: 18, color: '#222',
  },
  btn: {
    backgroundColor: ORANGE, borderRadius: 10,
    padding: 16, alignItems: 'center', marginBottom: 14,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  back: { color: ORANGE, textAlign: 'center', fontSize: 14 },
});
