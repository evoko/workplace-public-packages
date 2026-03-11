import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import { PickersCalendarHeaderProps } from '@mui/x-date-pickers/PickersCalendarHeader';
import { ChevronLeftIcon, ChevronRightIcon } from '@bwp-web/assets';

const CustomCalendarHeaderRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingLeft: '16px',
  paddingRight: '16px',
  backgroundColor: theme.palette.background.paper,
  borderBottomWidth: '0.6px',
  borderBottomStyle: 'solid',
  borderBottomColor: theme.palette.dividers.secondary,
  minHeight: '44px',
}));

export function CustomCalendarHeader(props: PickersCalendarHeaderProps) {
  const { currentMonth, onMonthChange } = props;

  const selectNextMonth = () => onMonthChange(currentMonth.add(1, 'month'));
  const selectPreviousMonth = () =>
    onMonthChange(currentMonth.subtract(1, 'month'));

  return (
    <CustomCalendarHeaderRoot>
      <Stack spacing={1} direction="row">
        <IconButton onClick={selectPreviousMonth} title="Previous month">
          <ChevronLeftIcon variant="xs" />
        </IconButton>
      </Stack>
      <Typography variant="body2" fontWeight="fontWeightMedium">
        {currentMonth.format('MMMM YYYY')}
      </Typography>
      <Stack spacing={1} direction="row">
        <IconButton onClick={selectNextMonth} title="Next month">
          <ChevronRightIcon variant="xs" />
        </IconButton>
      </Stack>
    </CustomCalendarHeaderRoot>
  );
}
