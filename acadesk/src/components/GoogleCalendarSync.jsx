import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';

export default function GoogleCalendarSync({ task }) {
  const syncToCalendar = async (accessToken) => {
    // Format the task data into a Google Calendar Event object
    const event = {
      summary: `[${task.course}] ${task.title}`,
      description: `Deadline managed via Synchronicity. Group: ${task.group}`,
      start: {
        dateTime: task.date,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        // Defaulting the event duration to 1 hour
        dateTime: new Date(new Date(task.date).getTime() + 60 * 60 * 1000).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (response.ok) {
        alert('Successfully synced to Google Calendar!');
      } else {
        console.error('Failed to sync', await response.text());
        alert('Failed to sync. Check console for details.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Configure the Google Login hook
  const loginAndSync = useGoogleLogin({
    onSuccess: (tokenResponse) => syncToCalendar(tokenResponse.access_token),
    scope: 'https://www.googleapis.com/auth/calendar.events',
    onError: () => alert('Login Failed'),
  });

  return (
    <button 
      onClick={() => loginAndSync()}
      className="px-3 py-1.5 text-xs font-semibold bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
    >
      Sync to Google
    </button>
  );
}