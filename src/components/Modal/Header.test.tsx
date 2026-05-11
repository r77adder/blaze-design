import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal, ModalStack } from '.'

jest.mock('../../hooks', () => {
  const actual = jest.requireActual('../../hooks')
  return {
    ...actual,
    useResponsiveDesign: jest.fn(),
  }
})
const { useResponsiveDesign } = jest.requireMock('../../hooks') as { useResponsiveDesign: jest.Mock }

const defaultStackManager = {
  stack: [],
  openModal: jest.fn(),
  closeModal: jest.fn(),
  closeModals: jest.fn(),
  closeAllModals: jest.fn(),
  closeStack: jest.fn(),
}

describe('Header', () => {
  describe('Hero variant', () => {
    it('renders the hero', async () => {
      useResponsiveDesign.mockReturnValue({ isMobile: false })
      render(
        <ModalStack stackManager={defaultStackManager}>
          <Modal.Root>
            <Modal.Header title="Copy modal" variant="hero" heroImage="image" heroImageAlt="alt"></Modal.Header>
          </Modal.Root>
        </ModalStack>,
      )
      expect(screen.getByText('Copy modal')).toBeVisible()
      expect(screen.getByRole('img')).toHaveAttribute('src', 'image')
      expect(screen.getByRole('img')).toHaveAttribute('alt', 'alt')
    })

    it('renders the hero in mobile and has close button', async () => {
      useResponsiveDesign.mockReturnValue({ isMobile: true })
      const onClose = jest.fn()
      render(
        <ModalStack stackManager={defaultStackManager}>
          <Modal.Root>
            <Modal.Header
              title="Copy modal"
              variant="hero"
              heroImage="image"
              heroImageAlt="alt"
              onClose={onClose}
            ></Modal.Header>
          </Modal.Root>
        </ModalStack>,
      )
      expect(screen.getByText('Copy modal')).toBeVisible()
      expect(screen.getByRole('img')).toHaveAttribute('src', 'image')
      expect(screen.getByRole('img')).toHaveAttribute('alt', 'alt')

      const closeBtn = screen.getByRole('button', { name: 'Close' })
      await userEvent.click(closeBtn)
      expect(onClose).toHaveBeenCalled()
    })
  })
})
