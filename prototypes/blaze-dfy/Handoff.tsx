import { useState } from 'react';
import { Modal, Text } from '@/components';
import type { StackModalProps } from '@/components';
import { Select } from '@/staging';
import { ACCOUNT_MANAGERS } from './lib/api';
import type { Account } from './lib/types';
import { Field, TextArea } from './ui';

/** Hand the workspace to a different account manager. The new owner gets
 *  access; an optional note becomes the account's next step. */
export function HandoffModal({ close, account, onConfirm }: StackModalProps & {
  account: Account;
  onConfirm: (amName: string, note: string) => void;
}) {
  const [amName, setAmName] = useState('');
  const [note, setNote] = useState('');
  const options = ACCOUNT_MANAGERS
    .filter((m) => m.name !== account.am.name)
    .map((m) => ({ value: m.name, label: m.name }));

  return (
    <Modal.Root size="sm" aria-labelledby="handoff-title">
      <Modal.Header title="Hand off workspace" id="handoff-title" onClose={close} />
      <Modal.Content>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Text variant="secondary" color="var(--dark-60)" style={{ lineHeight: 1.55 }}>
            Transfer ownership to another account manager. They get access, and your note (if any) becomes the next step.
          </Text>
          <Field label="Hand off to" hint={`Currently owned by ${account.am.name}.`}>
            <Select
              value={amName}
              onChange={setAmName}
              options={options}
              placeholder="Search account managers…"
              size="lg"
              fullWidth
            />
          </Field>
          <Field label="Note for the next owner" hint="Optional. Leave blank to keep the suggested next step.">
            <TextArea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's done, and what they need to pick up next…"
              style={{ minHeight: 96 }}
            />
          </Field>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="secondary" size="md" onPress={close}>Cancel</Modal.FooterButton>
          <Modal.FooterButton variant="primary" size="md" isDisabled={!amName} onPress={() => onConfirm(amName, note.trim())}>
            Hand off
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}
