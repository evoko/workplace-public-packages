import { NoResultsIcon } from '@bwp-web/assets';
import {
  BiampTableStatusMessage,
  type BiampTableStatusMessageProps,
} from './BiampTableStatusMessage';

export type BiampTableEmptyStateProps = Partial<BiampTableStatusMessageProps>;

export function BiampTableEmptyState({
  icon = <NoResultsIcon />,
  title = 'Nothing to show',
  ...rest
}: BiampTableEmptyStateProps) {
  return <BiampTableStatusMessage icon={icon} title={title} {...rest} />;
}
