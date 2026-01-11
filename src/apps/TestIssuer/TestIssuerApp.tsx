/**
 * Test Issuer App
 *
 * Main application component for issuing test credentials via Orbit LOB.
 * Allows selecting credential schemas, filling in data, and generating QR codes
 * for wallet scanning.
 *
 * Features:
 * - WebSocket connection for real-time credential exchange updates
 * - Credential catalog management
 * - Offer creation and tracking
 */

import { useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAppTracking } from '../../hooks/useAppTracking';
import { useOrbitSocket, OrbitEventType, OrbitEventData } from '../../hooks/useOrbitSocket';
import { useTestIssuerStore } from '../../store/testIssuerStore';
import CredentialCatalog from './components/CredentialCatalog';
import CredentialForm from './components/CredentialForm';
import OffersList from './components/OffersList';
import OfferDetail from './components/OfferDetail';

export default function TestIssuerApp() {
  useAppTracking('test-issuer', 'Test Issuer');

  const updateOfferStatusFromSocket = useTestIssuerStore(
    (state) => state.updateOfferStatusFromSocket
  );

  // Handle socket events for real-time updates
  const handleSocketEvent = useCallback(
    (event: OrbitEventType, data: OrbitEventData) => {
      console.log('[TestIssuer] Socket event:', event, data);

      // Map socket events to offer status updates
      switch (event) {
        case 'offer_accepted':
          if (data.offerId) {
            updateOfferStatusFromSocket(data.offerId, 'accepted');
          }
          break;
        case 'credential_issued':
          if (data.offerId) {
            updateOfferStatusFromSocket(data.offerId, 'issued');
          }
          break;
        case 'done':
          if (data.offerId) {
            updateOfferStatusFromSocket(data.offerId, 'completed');
          }
          break;
        case 'error':
          if (data.offerId) {
            updateOfferStatusFromSocket(data.offerId, 'failed');
          }
          break;
      }
    },
    [updateOfferStatusFromSocket]
  );

  // Connect to Orbit WebSocket for real-time updates
  const { connected, sessionId, error: socketError } = useOrbitSocket({
    appName: 'testIssuer',
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
        <Route path="/" element={<CredentialCatalog />} />
        <Route path="/issue/:schemaId" element={<CredentialForm />} />
        <Route path="/offers" element={<OffersList />} />
        <Route path="/offers/:id" element={<OfferDetail />} />
      </Routes>
    </div>
  );
}
