import { ServiceNotReachableIcon } from '@bwp-web/assets';
import {
  BiampTableStatusMessage,
  type BiampTableStatusMessageProps,
} from './BiampTableStatusMessage';

export type BiampTableErrorStateProps = Partial<BiampTableStatusMessageProps>;

export function BiampTableErrorState({
  icon = <ServiceNotReachableIcon />,
  title = 'Failed to load',
  ...rest
}: BiampTableErrorStateProps) {
  return (
    <BiampTableStatusMessage role="alert" icon={icon} title={title} {...rest} />
  );
}
