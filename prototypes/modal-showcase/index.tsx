import { useState } from 'react';
import { Button, Heading, Modal, ModalStack, Text, useModals } from '@/components';
import type { StackModalProps } from '@/components';
import { PrototypeShell } from '../_shell';

// section: simple modal — Header + Content + Footer
function SimpleModal({ close }: StackModalProps) {
  return (
    <Modal.Root size="sm" aria-labelledby="simple-modal-title" data-testid="simple-modal">
      <Modal.Header title="Save your draft?" id="simple-modal-title" onClose={close} />
      <Modal.Content>
        <Text variant="secondary">
          Your changes are unsaved. Save them now or keep editing — you can always come back to this.
        </Text>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Keep editing
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={close}>
            Save draft
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

// section: hero modal — heroImage + large title + close
function HeroModal({ close }: StackModalProps) {
  return (
    <Modal.Root size="md" aria-labelledby="hero-modal-title" data-testid="hero-modal">
      <Modal.Header
        variant="hero"
        title="Your account is connected!"
        heroImage="https://res.cloudinary.com/almanac/image/upload/v1755871734/blaze_assets/65cfcb6ed487608453ac773ecee3a53be5e327f9_exitid.png"
        heroImageAlt=""
        id="hero-modal-title"
        onClose={close}
        headingLevel={1}
      />
      <Modal.Content>
        <Text variant="secondary">
          Connect your channels, set a goal, and let Blaze run your growth program. Takes about
          three minutes.
        </Text>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={close}>
            Get started
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

// section: wizard modal — back button + footer with prev/next
function WizardModal({ close }: StackModalProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  return (
    <Modal.Root size="md" aria-labelledby="wizard-modal-title" data-testid="wizard-modal">
      <Modal.Header
        title={`Step ${step} of ${totalSteps}`}
        id="wizard-modal-title"
        onClose={close}
        onBack={step > 1 ? () => setStep((s) => s - 1) : undefined}
        compact={false}
      />
      <Modal.Content>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Heading level={4}>
            {step === 1 && 'Pick your channels'}
            {step === 2 && 'Set your goals'}
            {step === 3 && 'Review and launch'}
          </Heading>
          <Text variant="secondary">
            {step === 1 && 'Choose where you want Blaze to publish content.'}
            {step === 2 && 'What outcome are you optimizing for?'}
            {step === 3 && "Here's what we'll do for you over the next 30 days."}
          </Text>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Cancel
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          {step < totalSteps ? (
            <Modal.FooterButton variant="primary" onPress={() => setStep((s) => s + 1)}>
              Continue
            </Modal.FooterButton>
          ) : (
            <Modal.FooterButton variant="primary" onPress={close}>
              Launch
            </Modal.FooterButton>
          )}
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

// section: stacked — opens a confirm modal on top of itself
function StackedFirstModal({ close }: StackModalProps) {
  const { openModal } = useModals();
  return (
    <Modal.Root size="sm" aria-labelledby="stacked-first-title" data-testid="stacked-first">
      <Modal.Header title="Delete this campaign?" id="stacked-first-title" onClose={close} />
      <Modal.Content>
        <Text variant="secondary">
          This will permanently remove the campaign and all of its scheduled posts.
        </Text>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Cancel
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="danger" onPress={() => openModal(StackedConfirmModal)}>
            Delete
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

function StackedConfirmModal({ close }: StackModalProps) {
  return (
    <Modal.Root size="xs" aria-labelledby="stacked-confirm-title" data-testid="stacked-confirm">
      <Modal.Header title="Are you sure?" id="stacked-confirm-title" onClose={close} />
      <Modal.Content>
        <Text variant="secondary">This action can&apos;t be undone.</Text>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            No, keep it
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="danger" onPress={close}>
            Yes, delete
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

function Body() {
  const { openModal } = useModals();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 720 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Heading level={3}>Modal showcase</Heading>
        <Text variant="secondary">
          End-to-end demo of the vetted Modal subtree. Each button below opens a different
          configuration so reviewers can confirm parity with prod.
        </Text>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <Button variant="primary" onPress={() => openModal(SimpleModal)} data-testid="open-simple">
          Open simple modal
        </Button>
        <Button variant="primary" onPress={() => openModal(HeroModal)} data-testid="open-hero">
          Open hero modal
        </Button>
        <Button variant="primary" onPress={() => openModal(WizardModal)} data-testid="open-wizard">
          Open 3-step wizard
        </Button>
        <Button
          variant="danger"
          onPress={() => openModal(StackedFirstModal)}
          data-testid="open-stacked"
        >
          Open stacked confirm
        </Button>
      </div>
    </div>
  );
}

export default function ModalShowcase() {
  return (
    <ModalStack>
      <PrototypeShell title="Modal showcase">
        <Body />
      </PrototypeShell>
    </ModalStack>
  );
}
