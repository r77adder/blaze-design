import cx from 'classnames'
import { IStackManager } from './Types'
import Styles from './Modals.module.scss'
import { Underlay } from './Underlay'
import { CSSTransition, Transition, TransitionGroup } from 'react-transition-group'
import { StackButtonsContainer } from './StackButtonsContainer'

interface Props {
  stackManager: IStackManager
}

const hideUnderlay = (stack: IStackManager['stack']) => stack[stack.length - 1]?.options?.hideUnderlay
const underlayVariant = (stack: IStackManager['stack']) => stack[stack.length - 1]?.options?.underlayVariant

const StackedModals = ({
  stack,
  closeModal,
}: {
  stack: IStackManager['stack']
  closeModal: IStackManager['closeModal']
}) => (
  <>
    <Underlay isVisible={stack.length > 0 && !hideUnderlay(stack)} variant={underlayVariant(stack)} />
    <Transition unmountOnExit in={stack.length > 0} timeout={300}>
      <div className={Styles.stack}>
        <TransitionGroup component={null}>
          {stack.map(({ component: Component, props }, index) => (
            <CSSTransition
              key={index}
              timeout={300}
              appear
              unmountOnExit
              classNames={{
                appear: Styles.enter,
                appearActive: Styles.enterActive,
                enter: Styles.enter,
                enterActive: Styles.enterActive,
                exit: Styles.exit,
                exitActive: Styles.exitActive,
              }}
            >
              <div className={Styles.mounter}>
                <div
                  className={cx(Styles.presenter, {
                    [Styles.show!]: index === stack.length - 1,
                    [Styles.hide!]: index < stack.length - 1,
                  })}
                >
                  <Component
                    key={index}
                    index={index}
                    isOpen={index === stack.length - 1}
                    close={closeModal}
                    {...props}
                  />
                </div>
              </div>
            </CSSTransition>
          ))}
        </TransitionGroup>
      </div>
    </Transition>
  </>
)

const partitionStack = (stack: IStackManager['stack']): IStackManager['stack'][] => {
  const partitions: IStackManager['stack'][] = []
  let currentPartition: IStackManager['stack'] = []

  for (const modal of stack) {
    if (modal.options?.newStack) {
      partitions.push(currentPartition)
      currentPartition = [modal]
    } else {
      currentPartition.push(modal)
    }
  }

  if (currentPartition.length > 0) {
    partitions.push(currentPartition)
  }

  partitions.push([])

  return partitions
}

export const Modals = ({ stackManager }: Props) => {
  const { stack, closeModal } = stackManager
  const stacks = partitionStack(stack)

  return (
    <>
      <StackButtonsContainer />
      {stacks.map((stack, index) => (
        <StackedModals key={index} closeModal={closeModal} stack={stack} />
      ))}
    </>
  )
}
