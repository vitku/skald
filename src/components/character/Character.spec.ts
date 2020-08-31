import { shallowMount } from '@vue/test-utils'
import Character from './Character.vue'

describe('Mounted App', () => {
  it('renders correctly', () => {
    const wrapper = shallowMount(Character)
    expect(wrapper.element).toMatchSnapshot()
  })
})
