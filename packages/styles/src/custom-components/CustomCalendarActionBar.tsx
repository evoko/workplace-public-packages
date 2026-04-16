import Button from '@mui/material/Button';
import DialogActions, { DialogActionsProps } from '@mui/material/DialogActions';
import {
  usePickerTranslations,
  usePickerContext,
} from '@mui/x-date-pickers/hooks';
import type { PickersActionBarAction } from '@mui/x-date-pickers/PickersActionBar';

interface CustomCalendarActionBarProps extends DialogActionsProps {
  actions?: PickersActionBarAction[];
}

export function CustomCalendarActionBar({ actions, ...other }: CustomCalendarActionBarProps) {
  const translations = usePickerTranslations();
  const {
    clearValue,
    setValueToToday,
    acceptValueChanges,
    cancelValueChanges,
    goToNextStep,
    hasNextStep,
  } = usePickerContext();

  if (!actions || actions.length === 0) {
    return null;
  }

  const buttons = actions.map((actionType) => {
    switch (actionType) {
      case 'clear':
        return (
          <Button key={actionType} variant="outlined" size='small' onClick={clearValue}>
            {translations.clearButtonLabel}
          </Button>
        );
      case 'cancel':
        return (
          <Button key={actionType} variant="outlined" size='small' onClick={cancelValueChanges}>
            {translations.cancelButtonLabel}
          </Button>
        );
      case 'accept':
        return (
          <Button key={actionType} variant="contained" size='small' color="primary" onClick={acceptValueChanges}>
            {translations.okButtonLabel}
          </Button>
        );
      case 'today':
        return (
          <Button key={actionType} variant="outlined" size='small' onClick={setValueToToday}>
            {translations.todayButtonLabel}
          </Button>
        );
      case 'next':
        return (
          <Button key={actionType} variant="outlined" size='small' onClick={goToNextStep}>
            {translations.nextStepButtonLabel}
          </Button>
        );
      case 'nextOrAccept':
        return hasNextStep ? (
          <Button key={actionType} variant="outlined" size='small' onClick={goToNextStep}>
            {translations.nextStepButtonLabel}
          </Button>
        ) : (
          <Button key={actionType} variant="contained" size='small' color="primary" onClick={acceptValueChanges}>
            {translations.okButtonLabel}
          </Button>
        );
      default:
        return null;
    }
  });

  return <DialogActions sx={{p:1}} {...other}>{buttons}</DialogActions>;
}
