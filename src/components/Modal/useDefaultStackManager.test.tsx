import { act, renderHook } from '@testing-library/react'
import { useDefaultStackManager } from './useDefaultStackManager'

const Modal = ({ title }: { title: string }) => <div>{title}</div>

describe(useDefaultStackManager, () => {
  describe('openModal', () => {
    it('pushes modals on the stack', () => {
      const props = [{ title: 'Modal 1' }, { title: 'Modal 2' }]
      const { result } = renderHook(() => useDefaultStackManager())

      act(() => result.current.openModal(Modal, props[0]))
      expect(result.current.stack.length).toBe(1)
      expect(result.current.stack[0]!.component).toEqual(Modal)
      expect(result.current.stack[0]!.props).toEqual(props[0])

      act(() => result.current.openModal(Modal, props[1]))
      expect(result.current.stack.length).toBe(2)
      expect(result.current.stack[1]!.component).toEqual(Modal)
      expect(result.current.stack[1]!.props).toEqual(props[1])
    })

    it('replaces modals in the stack', () => {
      const props = [{ title: 'Modal 1' }, { title: 'Modal 2' }, { title: 'Modal 3' }, { title: 'Modal 4' }]
      const { result } = renderHook(() => useDefaultStackManager())

      act(() => result.current.openModal(Modal, props[0]))
      act(() => result.current.openModal(Modal, props[1]))
      act(() => result.current.openModal(Modal, props[2]))
      act(() => result.current.openModal(Modal, props[3], { replace: 2 }))
      expect(result.current.stack.length).toBe(2)
    })
  })

  describe('closeModal', () => {
    it('pops modals off the stack', () => {
      const props = [{ title: 'Modal 1' }, { title: 'Modal 2' }]
      const { result } = renderHook(() => useDefaultStackManager())

      act(() => {
        result.current.openModal(Modal, props[0])
        result.current.openModal(Modal, props[1])
      })
      expect(result.current.stack.length).toBe(2)

      act(() => result.current.closeModal())
      expect(result.current.stack.length).toBe(1)
      expect(result.current.stack[0]!.component).toEqual(Modal)
      expect(result.current.stack[0]!.props).toEqual(props[0])

      act(() => result.current.closeModal())
      expect(result.current.stack.length).toBe(0)
    })
  })

  describe('closeAllModals', () => {
    it('clears all stacks', () => {
      const props = [{ title: 'Modal 1' }, { title: 'Modal 2' }, { title: 'Modal 3' }]
      const { result } = renderHook(() => useDefaultStackManager())

      act(() => {
        result.current.openModal(Modal, props[0])
        result.current.openModal(Modal, props[1])
        result.current.openModal(Modal, props[2], { newStack: true })
      })
      expect(result.current.stack.length).toBe(3)

      act(() => result.current.closeAllModals())
      expect(result.current.stack.length).toBe(0)
    })
  })

  describe('closeStack', () => {
    it('clears the most recent stack', () => {
      const props = [{ title: 'Modal 1' }, { title: 'Modal 2' }, { title: 'Modal 3' }, { title: 'Modal 4' }]
      const { result } = renderHook(() => useDefaultStackManager())

      act(() => {
        result.current.openModal(Modal, props[0])
        result.current.openModal(Modal, props[1])
        result.current.openModal(Modal, props[2], { newStack: true })
        result.current.openModal(Modal, props[3])
      })
      expect(result.current.stack.length).toBe(4)

      act(() => result.current.closeStack())
      expect(result.current.stack.length).toBe(2)
    })
  })
})
