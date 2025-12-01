'use client'

import { authClient } from '@/lib/auth/auth-client';
import { useState, useCallback, memo } from 'react';
import type { Session } from 'better-auth/types';

interface SessionManageTabProps {
    initialSessions: Session[];
    currentSessionId?: string;
    className?: string;
}

const SessionManageTab = memo(function SessionManageTab({ 
    initialSessions, 
    currentSessionId,
    className = '' 
}: SessionManageTabProps) {
    const [sessions, setSessions] = useState<Session[]>(() => {
        return initialSessions.map(session => ({
            ...session,
            isCurrent: session.id === currentSessionId
        }));
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);

    // Refresh sessions from server
    const refreshSessions = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await authClient.listSessions();
            const sessionsData = response?.data || [];
            
            const updatedSessions = Array.isArray(sessionsData) 
                ? sessionsData.map(session => ({
                    ...session,
                    isCurrent: session.id === currentSessionId
                }))
                : [];
                
            setSessions(updatedSessions);
        } catch (error) {
            console.error('Error refreshing sessions:', error);
            setError('Failed to refresh sessions');
        } finally {
            setLoading(false);
        }
    }, [currentSessionId]);

    // Handle session revocation with token-based API call
    const handleRevokeSession = useCallback(async (sessionId: string) => {
        if (sessionId === currentSessionId) {
            setError('Cannot revoke current session');
            return;
        }

        const sessionToRevoke = sessions.find(s => s.id === sessionId);
        if (!sessionToRevoke || !sessionToRevoke.token) {
            setError('Session token not found');
            return;
        }

        try {
            setRevokingSessionId(sessionId);
            setError(null);
            
            // Optimistically remove session from UI
            setSessions(prev => prev.filter(session => session.id !== sessionId));
            
            // Call authClient to revoke session using token
            await authClient.revokeSession({
                token: sessionToRevoke.token
            });
            
        } catch (error) {
            console.error('Error revoking session:', error);
            setError('Failed to revoke session');
            
            // Restore session on error
            const originalSession = initialSessions.find(s => s.id === sessionId);
            if (originalSession) {
                setSessions(prev => [...prev, {
                    ...originalSession,
                    isCurrent: originalSession.id === currentSessionId
                }]);
            }
        } finally {
            setRevokingSessionId(null);
        }
    }, [currentSessionId, initialSessions, sessions]);

    // Get device type from user agent
    const getDeviceType = useCallback((userAgent?: string | null) => {
        if (!userAgent) return 'Unknown Device';
        
        const ua = userAgent.toLowerCase();
        if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
            return 'Mobile';
        }
        if (ua.includes('tablet') || ua.includes('ipad')) {
            return 'Tablet';
        }
        return 'Desktop';
    }, []);

    // Format relative time
    const getRelativeTime = useCallback((dateInput: string | Date) => {
        const date = new Date(dateInput);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return `${diffDays} days ago`;
    }, []);

    return (
        <div className={`session-manage-tab ${className}`}>
            <div className="session-header">
                <h2 className="session-title">Active Sessions</h2>
                {error && (
                    <div className="error-message">
                        {error}
                        <button onClick={() => setError(null)} aria-label="Close error">×</button>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="sessions-list">
                    {[1, 2].map((i) => (
                        <div key={i} className="session-item loading-animation">
                            <div className="session-info">
                                <div className="loading-text-block" />
                                <div className="loading-text-line" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : sessions.length > 0 ? (
                <div className="sessions-list">
                    {sessions.map((session) => {
                        const deviceType = getDeviceType(session.userAgent);
                        const isRevoking = revokingSessionId === session.id;
                        const isCurrent = session.id === currentSessionId;
                        
                        return (
                            <div 
                                key={session.id} 
                                className={`session-item ${isCurrent ? 'current' : ''} ${isRevoking ? 'revoking' : ''}`}
                            >
                                <div className="session-info">
                                    <div className="device-type">
                                        {deviceType}
                                        {isCurrent && <span className="current-badge">Current</span>}
                                    </div>
                                    <div className="session-time">
                                        {getRelativeTime(session.createdAt)}
                                    </div>
                                </div>
                                
                                {!isCurrent && (
                                    <button
                                        onClick={() => handleRevokeSession(session.id)}
                                        className="revoke-btn"
                                        disabled={isRevoking}
                                        aria-label={`Revoke ${deviceType} session`}
                                    >
                                        {isRevoking ? 'Revoking...' : 'Revoke'}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="empty-sessions">
                    <p>No active sessions found</p>
                    <button onClick={refreshSessions} disabled={loading}>
                        {loading ? 'Loading...' : 'Refresh'}
                    </button>
                </div>
            )}
        </div>
    );
});

export default SessionManageTab;