import { Heading, Text } from '@/components';
import { PrototypeShell, StatePicker, useStateContext } from '../_shell';

function Body() {
  const { state } = useStateContext();
  return (
    <div>
      <Heading level={4}>hello, world</Heading>
      <div style={{ marginTop: 16 }}>
        <Text variant="secondary">
          Current state: <Text variant="smallList">{state}</Text>
        </Text>
      </div>
    </div>
  );
}

export default function HelloWorld() {
  return (
    <StatePicker states={['cold', 'steady', 'error']} defaultState="steady">
      <PrototypeShell title="Hello world">
        <Body />
      </PrototypeShell>
    </StatePicker>
  );
}
