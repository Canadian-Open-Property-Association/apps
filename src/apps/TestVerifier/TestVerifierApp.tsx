/**
 * Test Verifier App
 *
 * Main application component for verifying credentials via Orbit LOB.
 * Allows selecting proof templates, generating QR codes for proof requests,
 * and viewing verification results.
 *
 * Features:
 * - WebSocket connection for real-time verification updates
 * - Published template catalog from Proof Template Builder
 * - Proof request generation and tracking
 */

import { useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAppTracking } from '../../hooks/useAppTracking';
import { useOrbitSocket, OrbitEventType, OrbitEventData } from '../../hooks/useOrbitSocket';
import { useTestVerifierStore } from '../../store/testVerifierStore';
import VerifierCatalog from './components/VerifierCatalog';
import ProofRequestForm from './components/ProofRequestForm';
import ProofRequestDisplay from './components/ProofRequestDisplay';
import VerificationHistory from './components/VerificationHistory';

export default function TestVerifierApp() {
  useAppTracking('test-verifier', 'Test Verifier');

  const updateProofRequestStatusFromSocket = useTestVerifierStore(
    (state) => state.updateProofRequestStatusFromSocket
  );

  // Handle socket events for real-time updates
  const handleSocketEvent = useCallback(
    (event: OrbitEventType, data: OrbitEventData) => {
      console.log('[TestVerifier] Socket event:', event, data);

      // Map socket events to proof request status updates
      const credProofId = data.credProofId as string | undefined;
      switch (event) {
        case 'proof_scanned':
          if (credProofId) {
            updateProofRequestStatusFromSocket(credProofId, 'scanned');
          }
          break;
        case 'proof_request_sent':
          if (credProofId) {
            updateProofRequestStatusFromSocket(credProofId, 'request-sent');
          }
          break;
        case 'proof_received':
          if (credProofId) {
            updateProofRequestStatusFromSocket(credProofId, 'proof-received');
          }
          break;
        case 'proof_verified':
          if (credProofId) {
            updateProofRequestStatusFromSocket(credProofId, 'verified', data.result as string | undefined);
          }
          break;
        case 'done':
          if (credProofId) {
            // Check if it's a verification success or failure
            if (data.success) {
              updateProofRequestStatusFromSocket(credProofId, 'verified', data.result as string | undefined);
            }
          }
          break;
        case 'error':
          if (credProofId) {
            updateProofRequestStatusFromSocket(credProofId, 'failed');
          }
          break;
      }
    },
    [updateProofRequestStatusFromSocket]
  );

  // Connect to Orbit WebSocket for real-time updates
  const { connected, sessionId, error: socketError } = useOrbitSocket({
    appName: 'testVerifier',
    onEvent: handleSocketEvent,
    enabled: true,
  });

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Socket connection indicator (dev mode only) */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-medium shadow-lg ${
              connected
                ? 'bg-green-100 text-green-700'
                : socketError
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
            title={
              connected
                ? `Connected: ${sessionId}`
                : socketError || 'Connecting...'
            }
          >
            <span
              className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                connected ? 'bg-green-500' : socketError ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
              }`}
            />
            {connected ? 'Socket' : socketError ? 'Error' : 'Connecting'}
          </div>
        </div>
      )}

      <Routes>
        <Route path="/" element={<VerifierCatalog socketSessionId={sessionId} />} />
        <Route path="/verify/:templateId" element={<ProofRequestForm socketSessionId={sessionId} />} />
        <Route path="/request/:id" element={<ProofRequestDisplay />} />
        <Route path="/history" element={<VerificationHistory />} />
      </Routes>
    </div>
  );
}
