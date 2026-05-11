import { useMemo, useState } from 'react'
import { IStackManager, Stack } from './Types'
import { findLastIndex } from 'lodash'

export const useDefaultStackManager = () => {
  const [stack, setStack] = useState<Stack>([])
  const [stackButtonsContainer, setStackButtonsContainer] = useState<HTMLDivElement | null>(null)

  const context = useMemo<IStackManager>(() => {
    const closeModals = (count: number) => setStack((prev) => [...prev].slice(0, prev.length - count))
    return {
      stack,
      openModal: (component, props, { replace = false, ...options } = { replace: false }) => {
        setStack((stack) => [...stack.slice(0, stack.length - Number(replace)), { component, props, options }])
      },
      closeModal: () => closeModals(1),
      closeAllModals: () => setStack([]),
      closeStack: () =>
        setStack((prev) => {
          const lastIndex = findLastIndex(prev, ({ options }) => !!options?.newStack)
          if (lastIndex < 0) {
            return []
          }

          return prev.slice(0, lastIndex)
        }),
      closeModals,
    }
  }, [stack])

  return {
    ...context,
    stackButtonsContainer,
    setStackButtonsContainer,
  }
}
