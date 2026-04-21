/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

const BRAND_NAME = 'FurēPET'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head>
      <meta name="color-scheme" content="light dark" />
      <meta name="supported-color-schemes" content="light dark" />
    </Head>
    <Preview>Confirm your email for {BRAND_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to {BRAND_NAME}</Heading>
        <Text style={text}>
          Thanks for signing up for{' '}
          <Link href={siteUrl} style={link}>
            <strong>{BRAND_NAME}</strong>
          </Link>
          {' '}— the ultimate pet passport.
        </Text>
        <Text style={text}>
          Please confirm your email address (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ) by tapping the button below:
        </Text>
        <Button style={button} href={confirmationUrl}>
          <span style={buttonText}>Verify Email</span>
        </Button>
        <Text style={footer}>
          If you didn't create a {BRAND_NAME} account, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif", colorScheme: 'light dark' as const }
const container = { padding: '24px 28px', maxWidth: '560px' }
const logoSection = { textAlign: 'center' as const, margin: '0 0 24px' }
const logo = { display: 'block', margin: '0 auto', borderRadius: '12px' }
const h1 = { fontSize: '24px', fontWeight: 600 as const, color: '#1a1a1a', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#55575d', lineHeight: '1.6', margin: '0 0 20px' }
const link = { color: '#2E7D32', textDecoration: 'underline' }
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
