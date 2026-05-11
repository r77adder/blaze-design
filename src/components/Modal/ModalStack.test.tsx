import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModalStack } from './ModalStack'
import { IStackManager, StackModalProps } from './Types'

const Modal = ({ index, title, close }: StackModalProps & { title: string }) => (
  <div>
    {title}
    <span data-testid="stack-index">{index}</span>
    <button onClick={close}>Close {title}</button>
  </div>
)

const defaultStackManager = {
  stack: [],
  openModal: jest.fn(),
  closeModal: jest.fn(),
  closeModals: jest.fn(),
  closeAllModals: jest.fn(),
  closeStack: jest.fn(),
}

describe(ModalStack, () => {
  const stackManager: IStackManager = {
    ...defaultStackManager,
    stack: [
      { component: Modal, props: { title: 'Modal 1' } },
      { component: Modal, props: { title: 'Modal 2' } },
    ],
  }

  it('renders all the modals in the current stack', async () => {
    render(<ModalStack stackManager={stackManager}>Page</ModalStack>)
    const pageContent = await screen.findByText('Page')
    const firstModal = await screen.findByText('Modal 1')
    const secondModal = await screen.findByText('Modal 2')
    expect(pageContent).toBeInTheDocument()
    expect(firstModal).toBeInTheDocument()
    expect(secondModal).toBeInTheDocument()
  })

  it('passes the close method to each modal', async () => {
    render(<ModalStack stackManager={stackManager}>Page</ModalStack>)
    const secondModalCloseBtn = await screen.findByText('Close Modal 2')
    await userEvent.click(secondModalCloseBtn)
    expect(defaultStackManager.closeModal).toHaveBeenCalled()
  })

  it('passes the index in the stack to each modal', async () => {
    render(<ModalStack stackManager={stackManager}>Page</ModalStack>)
    const indexSpans = await screen.findAllByTestId('stack-index')
    expect(indexSpans[0]).toHaveTextContent('0')
    expect(indexSpans[1]).toHaveTextContent('1')
  })
})
