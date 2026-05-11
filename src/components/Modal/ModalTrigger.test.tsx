import { render, screen } from '@testing-library/react'
import { ModalStack } from './ModalStack'
import { ModalTrigger } from './ModalTrigger'
import userEvent from '@testing-library/user-event'
import { Button } from '../Button/Button'

describe('ModalTrigger', () => {
  const stackManager = {
    stack: [],
    openModal: jest.fn(),
    closeModal: jest.fn(),
    closeModals: jest.fn(),
    closeAllModals: jest.fn(),
    closeStack: jest.fn(),
  }

  afterEach(() => {
    stackManager.openModal.mockReset()
  })

  const MyModal = (_props: { prop1: number }) => {
    return <div>my component</div>
  }

  it('opens the modal', async () => {
    render(
      <ModalStack stackManager={stackManager}>
        <ModalTrigger modal={MyModal} prop1={2} options={{ newStack: true }}>
          <Button>open modal</Button>
        </ModalTrigger>
      </ModalStack>,
    )
    const button = screen.getByText('open modal')
    await userEvent.click(button)
    expect(stackManager.openModal).toHaveBeenCalledTimes(1)
    expect(stackManager.openModal).toHaveBeenCalledWith(
      MyModal,
      expect.objectContaining({
        prop1: 2,
      }),
      expect.objectContaining({
        newStack: true,
      }),
    )
  })
})
