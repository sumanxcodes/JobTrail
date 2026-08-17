'use client';

import React, { useState } from 'react';
import { ApplicationStatus, APPLICATION_STATUSES } from '@/lib/types/database';
import { Select } from '@/components/ui/Select';
import { createClient } from '@/lib/supabase/client';

interface StatusSelectorProps {
  applicationId: string;
  currentStatus: ApplicationStatus;
  onStatusChange?: (newStatus: ApplicationStatus) => void;
}

export function StatusSelector({
  applicationId,
  currentStatus,
  onStatusChange,
}: StatusSelectorProps) {
  const [status, setStatus] = useState<ApplicationStatus>(currentStatus);
  const [updating, setUpdating] = useState(false);
  const supabase = createClient();

  const handleStatusChange = async (newVal: string) => {
    const nextStatus = newVal as ApplicationStatus;
    if (nextStatus === status) return;

    setStatus(nextStatus);
    setUpdating(true);

    try {
      // 1. Update application status
      const { error: appError } = await supabase
        .from('applications')
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', applicationId);

      if (appError) throw appError;

      // 2. Insert status history record
      const { error: histError } = await supabase.from('status_history').insert({
        application_id: applicationId,
        status: nextStatus,
        changed_at: new Date().toISOString(),
      });

      if (histError) throw histError;

      onStatusChange?.(nextStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
      // Revert on failure
      setStatus(currentStatus);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const options = APPLICATION_STATUSES.map((s) => ({
    value: s.value,
    label: s.label,
  }));

  return (
    <div style={{ minWidth: '160px', opacity: updating ? 0.7 : 1 }}>
      <Select
        value={status}
        onValueChange={handleStatusChange}
        options={options}
        disabled={updating}
      />
    </div>
  );
}
