import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal, ModalStack } from '.'

const defaultStackManager = {
  stack: [],
  openModal: jest.fn(),
  closeModal: jest.fn(),
  closeModals: jest.fn(),
  closeAllModals: jest.fn(),
  closeStack: jest.fn(),
}

describe('Modal', () => {
  describe('when pressing ESC', () => {
    it('calls the default closeModal', async () => {
      render(
        <ModalStack stackManager={defaultStackManager}>
          <Modal.Root />
        </ModalStack>,
      )
      await userEvent.keyboard('{Esc}')
      expect(defaultStackManager.closeModal).toHaveBeenCalled()
    })

    it('calls the passed onClose callback', async () => {
      const onClose = jest.fn()
      render(
        <ModalStack stackManager={defaultStackManager}>
          <Modal.Root onClose={onClose} />
        </ModalStack>,
      )
      await userEvent.keyboard('{Esc}')
      expect(onClose).toHaveBeenCalled()
      expect(defaultStackManager.closeModal).not.toHaveBeenCalled()
    })

    describe('when isKeyboardDismissDisabled is true', () => {
      it('does not call the default closeModal', async () => {
        render(
          <ModalStack stackManager={defaultStackManager}>
            <Modal.Root isKeyboardDismissDisabled>
              <button>Button</button>
            </Modal.Root>
          </ModalStack>,
        )
        await userEvent.keyboard('{Esc}')
        expect(defaultStackManager.closeModal).not.toHaveBeenCalled()
      })

      it('does not call the passed onClose', async () => {
        const onClose = jest.fn()
        render(<Modal.Root isKeyboardDismissDisabled onClose={onClose} />)
        await userEvent.keyboard('{Esc}')
        expect(onClose).not.toHaveBeenCalled()
      })
    })
  })

  describe('when pressing outside', () => {
    it('calls the default closeAllModals', async () => {
      render(
        <ModalStack stackManager={defaultStackManager}>
          <Modal.Root />
        </ModalStack>,
      )
      const underlay = await screen.findByTestId('modal-underlay')
      await userEvent.click(underlay)
      expect(defaultStackManager.closeAllModals).toHaveBeenCalled()
    })

    it('calls the passed onPressOutside callback', async () => {
      const onPressOutside = jest.fn()
      render(
        <ModalStack stackManager={defaultStackManager}>
          <Modal.Root onPressOutside={onPressOutside} />
        </ModalStack>,
      )
      const underlay = await screen.findByTestId('modal-underlay')
      await userEvent.click(underlay)
      expect(onPressOutside).toHaveBeenCalled()
      expect(defaultStackManager.closeAllModals).not.toHaveBeenCalled()
    })
  })
})
