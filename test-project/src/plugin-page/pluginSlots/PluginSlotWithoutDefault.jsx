import { PluginSlot } from '@openedx/frontend-base';

function PluginSlotWithoutDefault({ id, label }) {
  return (
    <div className="border border-primary">
      <h3 id={id} className="pl-3">{label}</h3>
      <PluginSlot
        id="slot_without_default"
      >
      </PluginSlot>
    </div>
  );
}
export default PluginSlotWithoutDefault;