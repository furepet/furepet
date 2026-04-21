/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

const LOGO_URL = 'https://sxzrzkgodbounjvrjcuj.supabase.co/storage/v1/object/public/email-assets/furepet-logo.png'

const BRAND_NAME = 'FurēPET'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ confirmationUrl }: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head>
      <meta name="color-scheme" content="light dark" />
      <meta name="supported-color-schemes" content="light dark" />
    </Head>
    <Preview>Reset your password for {BRAND_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img src={LOGO_URL} width="64" height="64" alt={BRAND_NAME} style={logo} />
        </Section>
        <Heading style={h1}>Reset your password</Heading>
        <Text style={text}>
          We received a request to reset your password for {BRAND_NAME}. Tap the button below to choose a new password.
        </Text>
        <Button style={button} href={confirmationUrl}>
          <span style={buttonText}>Reset Password</span>
        </Button>
        <Text style={footer}>
          If you didn't request a password reset, you can safely ignore this email — your password won't change.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif", colorScheme: 'light dark' as const }
const container = { padding: '24px 28px', maxWidth: '560px' }
const logoSection = { textAlign: 'center' as const, margin: '0 0 24px' }
const logo = { display: 'block', margin: '0 auto', borderRadius: '12px' }
const h1 = { fontSize: '24px', fontWeight: 600 as const, color: '#1a1a1a', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#55575d', lineHeight: '1.6', margin: '0 0 20px' }
const button = {
  backgroundColor: '#2E7D32',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 600 as const,
  borderRadius: '8px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
  border: '1px solid #2E7D32',
}
const buttonText = { color: '#ffffff' }
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0', lineHeight: '1.5' }
