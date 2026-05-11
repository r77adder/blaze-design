import { createContext, useContext } from 'react'
import { Modals } from './Modals'
import { IStackManager, ModalStackProviderProps } from './Types'
import { useDefaultStackManager } from './useDefaultStackManager'

export const ModalStackContext = createContext<IStackManager>({
  stack: [],
  openModal: () => {},
  closeModal: () => {},
  closeModals: () => {},
  closeAllModals: () => {},
  closeStack: () => {},
})

export const ModalStack = ({ children, stackManager }: ModalStackProviderProps) => {
  const defaultStackManager = useDefaultStackManager()
  const manager = stackManager || defaultStackManager

  return (
    <ModalStackContext.Provider value={manager}>
      {children}
      <Modals stackManager={manager} />
    </ModalStackContext.Provider>
  )
}

export const useModals = () => {
  return useContext(ModalStackContext)
}
