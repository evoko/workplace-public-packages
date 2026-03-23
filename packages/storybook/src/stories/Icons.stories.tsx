import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack, Typography, Box, Tooltip, Icon } from '@mui/material';

import {
  AccessibleIcon,
  AddIcon,
  AddPhotoIcon,
  AddScreenTvIcon,
  AdjustableDeskIcon,
  AppleIcon,
  AppsIcon,
  AppsIconFilled,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowsMaximizeIcon,
  ArrowsMinimizeIcon,
  ArrowsMoveIcon,
  ArrowUpIcon,
  ArrowUpRightIcon,
  AudioFileIcon,
  AudioLibraryIcon,
  AudioPolarityInversionIcon,
  AutoFitFilledIcon,
  AutoFitIcon,
  BadgeClockIcon,
  BadgeLiveIcon,
  BadgeSpeakIcon,
  BiampLaunchIcon,
  BiampLogoIcon,
  BikeIcon,
  BlankIcon,
  BlockIcon,
  BookmarkIcon,
  BuildingIcon,
  CalendarAddIcon,
  CalendarIcon,
  CameraIcon,
  CeilingIcon,
  CheckedIcon,
  ChevronDownIcon,
  ChevronFullLeftIcon,
  ChevronFullRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CircleCheckIcon,
  CircleFilledIcon,
  CircleHalfIcon,
  CircleIcon,
  CircleStopIcon,
  ClipboardListIcon,
  ClockIcon,
  ClockTimeIcon,
  CloseIcon,
  CloudIcon,
  CloudNoConnectionIcon,
  CloudUploadIcon,
  CodeIcon,
  CollapseTreeviewIcon,
  ColumnsIcon,
  CommandFileIcon,
  ComputerIcon,
  ConditionerIcon,
  ContrastIcon,
  ControlPanelIcon,
  CopyIcon,
  CursorIcon,
  DefineIcon,
  DeleteIcon,
  DesignFileIcon,
  DeskAltIcon,
  DeskIcon,
  DeskSolidIcon,
  DeviceSpeakerIcon,
  DisplayIcon,
  DistanceIcon,
  DoorRoomIcon,
  DownloadIcon,
  DragIcon,
  DropdownChevronDownIcon,
  DropdownChevronDuoIcon,
  DropdownChevronUpIcon,
  DualMonitorFilledIcon,
  EarIcon,
  EditIcon,
  ElectricVehicleChargingIcon,
  EmailIcon,
  EqualizerIcon,
  ErrorCircleIcon,
  ErrorStatusIcon,
  ExportIcon,
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
  FavoriteIcon,
  FileDesignIcon,
  FileIcon,
  FileReportIcon,
  FileTypeLogIcon,
  FileTypePdfIcon,
  FilterIcon,
  FirmwareUpdateIcon,
  FloorPlanIcon,
  FocusModeIcon,
  FolderOpenIcon,
  FollowScreenFilledIcon,
  FollowScreenIcon,
  ForgotPasswordIcon,
  FurnitureIcon,
  GhostDeskIcon,
  GlobeIcon,
  GroupIcon,
  IndeterminateIcon,
  InfoCircleIcon,
  InfoStatusIcon,
  InvertIcon,
  LayoutSidebarCollapseIcon,
  LayoutSidebarRightCollapseIcon,
  LicencesIcon,
  LightsIcon,
  LinkIcon,
  LinkOffIcon,
  ListIcon,
  LoaderIcon,
  LockIcon,
  LockOpenIcon,
  LockerIcon,
  LoginIcon,
  LogoutIcon,
  MapSiteIcon,
  MapZoomIcon,
  MaximizeIcon,
  MicIcon,
  MicrophoneIcon,
  MicrophoneOffIcon,
  MinimizeIcon,
  MinusIcon,
  MobildFilterIcon,
  MonitorFilledIcon,
  MoreIcon,
  MotorcycleFilledIcon,
  MsTeamsIcon,
  MusicNoteIcon,
  NetworkIcon,
  NoCardIcon,
  NoiseCancellingPanelsQuietZoneIcon,
  NoResultsIcon,
  OtherIcon,
  ParkingAltIcon,
  ParkingIcon,
  PauseIcon,
  PersonIcon,
  PhoneIcon,
  PhotoIcon,
  PinFilledIcon,
  PinLocationIcon,
  PinOutlinedIcon,
  PlayAnnouncementIcon,
  PlaybackSpeedIcon,
  PowerOutletFilledIcon,
  PrivateIcon,
  ProjectorIcon,
  QrIcon,
  QuestionmarkIcon,
  QueueAnnouncementIcon,
  ReceptionIcon,
  RefreshIcon,
  RepeatIcon,
  RestroomIcon,
  RocketLaunchIcon,
  RoomHubIcon,
  RoomIcon,
  RoomSolidIcon,
  RoomTempIcon,
  RotateIcon,
  RulerIcon,
  SaveIcon,
  SearchIcon,
  SelectIcon,
  SendIcon,
  ServiceNotReachableIcon,
  SettingsIcon,
  ShareIcon,
  SoundIcon,
  SourceIcon,
  SpeakerFilledIcon,
  SpeakerIcon,
  SpeakerMinimumVolumeFilledIcon,
  SpeakerOffFilledIcon,
  SpeakerOffIcon,
  SquareRoundedArrowRightFilledIcon,
  SquareRoundedArrowRightIcon,
  SquareRoundedPlusIcon,
  StarIcon,
  StopIcon,
  SuccessStatusIcon,
  SupportIcon,
  TeamMeetingIcon,
  TouchDisplayIcon,
  UncheckedIcon,
  UploadIcon,
  UsersIcon,
  UsersPlusSigninIcon,
  VideoCameraIcon,
  VideoConferenceIcon,
  VideoIcon,
  VideoProcessorFilledIcon,
  VideoProcessorIcon,
  WarningStatusIcon,
  WarningTriangleIcon,
  WeatherProtectionFilledIcon,
  WhiteboardIcon,
  WifiEnlargedIcon,
  WifiIcon,
  WirelessChargingFilledIcon,
  WorkshopIcon,
  ZoneIcon,
  BiampRedLogo,
  BookingApp,
  CommandApp,
  ConnectApp,
  DesignerApp,
  WorkplaceApp,
} from '@bwp-web/assets';

const meta: Meta = {
  title: 'Assets/Icons',
  argTypes: {
    iconColor: {
      control: 'color',
      description: 'Override color for all icons',
    },
  },
};

export default meta;
type Story = StoryObj<{ iconColor?: string }>;

const IconDisplay = ({
  name,
  children,
  onlyIcon = false,
}: {
  name?: string;
  children: ReactNode;
  onlyIcon?: boolean;
}) => {
  const box = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        p: 2,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        ...(onlyIcon ? { width: 56, height: 56 } : { minWidth: 120 }),
      }}
    >
      <Box sx={{ '& svg': { width: 24, height: 24 } }}>{children}</Box>
      {!onlyIcon && name && (
        <Typography variant="caption" align="center">
          {name}
        </Typography>
      )}
    </Box>
  );

  return onlyIcon && name ? (
    <Tooltip title={name} placement="top">
      {box}
    </Tooltip>
  ) : (
    box
  );
};

/**
 * All icons and images exported by `@bwp-web/assets`, organised by category.
 */
export const AllIcons: Story = {
  args: { iconColor: undefined },
  render: ({ iconColor }) => (
    <Box sx={{ color: iconColor || 'inherit' }}>
      <Stack spacing={3}>
        <Typography variant="h3">Layout Icons</Typography>
        <Typography variant="body2" color="text.secondary">
          Icons used in the Biamp Workplace shell (header, sidebar, app
          launcher). See the <strong>Icon Groups</strong> story for the full
          catalog.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <IconDisplay name="BiampLogoIcon">
            <BiampLogoIcon />
          </IconDisplay>
          <IconDisplay name="SearchIcon">
            <SearchIcon />
          </IconDisplay>
          <IconDisplay name="AppsIcon">
            <AppsIcon />
          </IconDisplay>
          <IconDisplay name="AppsIconFilled">
            <AppsIconFilled />
          </IconDisplay>
        </Box>

        <Typography variant="h3" sx={{ pt: 2 }}>
          Theme Icons
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Icons used internally by the theme for MUI component overrides
          (alerts, checkboxes, radio buttons). Status icons are theme-aware and
          adapt to dark/light mode.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <IconDisplay name="CheckedIcon">
            <CheckedIcon />
          </IconDisplay>
          <IconDisplay name="UncheckedIcon">
            <UncheckedIcon />
          </IconDisplay>
          <IconDisplay name="IndeterminateIcon">
            <IndeterminateIcon />
          </IconDisplay>
          <IconDisplay name="ErrorStatusIcon">
            <ErrorStatusIcon />
          </IconDisplay>
          <IconDisplay name="WarningStatusIcon">
            <WarningStatusIcon />
          </IconDisplay>
          <IconDisplay name="InfoStatusIcon">
            <InfoStatusIcon />
          </IconDisplay>
          <IconDisplay name="SuccessStatusIcon">
            <SuccessStatusIcon />
          </IconDisplay>
        </Box>

        <Typography variant="h3" sx={{ pt: 2 }}>
          Images
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Static image assets exported as data URLs.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              p: 2,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              minWidth: 120,
            }}
          >
            <Box
              component="img"
              src={BiampRedLogo}
              alt="Biamp Red Logo"
              sx={{ width: 24, height: 24 }}
            />
            <Typography variant="caption" align="center">
              BiampRedLogo
            </Typography>
          </Box>
        </Box>

        <Typography variant="h3" sx={{ pt: 2 }}>
          App Images
        </Typography>
        <Typography variant="body2" color="text.secondary">
          PNG images for the app-launcher dialog tiles. Each export is a data
          URL string.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {[
            { src: BookingApp, name: 'BookingApp' },
            { src: CommandApp, name: 'CommandApp' },
            { src: ConnectApp, name: 'ConnectApp' },
            { src: DesignerApp, name: 'DesignerApp' },
            { src: WorkplaceApp, name: 'WorkplaceApp' },
          ].map((img) => (
            <Box
              key={img.name}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                p: 2,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                minWidth: 120,
              }}
            >
              <Box
                component="img"
                src={img.src}
                alt={img.name}
                sx={{ width: 54, height: 54, objectFit: 'contain' }}
              />
              <Typography variant="caption" align="center">
                {img.name}
              </Typography>
            </Box>
          ))}
        </Box>
      </Stack>
    </Box>
  ),
};

/**
 * New SVG icons grouped by their size variant, rendered at 24px for visual consistency.
 * Pass the matching `variant` prop to multi-size icons so you see the design intended for that size.
 */

const CONFIG = {
  gap: 4,
  display: 'grid',
  maxWidth: 800,
  gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))',
};

export const IconGroups: Story = {
  name: 'Icon Groups',
  args: { iconColor: undefined },
  render: ({ iconColor }) => (
    <Box sx={{ color: iconColor || 'inherit' }}>
      <Stack spacing={6}>
        <Typography variant="h3" color="text.primary">
          Icon Groups by Size
        </Typography>

        {/* xxxxs — 6px */}
        <Stack spacing={4}>
          <Typography variant="h6" color="text.primary">
            xxxxs — 6px
          </Typography>
          <Box sx={{ ...CONFIG, flexWrap: 'wrap' }}>
            <IconDisplay name="BadgeClockIcon" onlyIcon>
              <BadgeClockIcon variant="xxxxs" />
            </IconDisplay>
            <IconDisplay name="BadgeLiveIcon" onlyIcon>
              <BadgeLiveIcon />
            </IconDisplay>
            <IconDisplay name="BadgeSpeakIcon" onlyIcon>
              <BadgeSpeakIcon variant="xxxxs" />
            </IconDisplay>
          </Box>
        </Stack>

        {/* xxxs — 8px */}
        <Stack spacing={4}>
          <Typography variant="h6" color="text.primary">
            xxxs — 8px
          </Typography>
          <Box sx={{ ...CONFIG, flexWrap: 'wrap' }}>
            <IconDisplay name="BadgeClockIcon" onlyIcon>
              <BadgeClockIcon variant="xxxs" />
            </IconDisplay>
            <IconDisplay name="BadgeSpeakIcon" onlyIcon>
              <BadgeSpeakIcon variant="xxxs" />
            </IconDisplay>
          </Box>
        </Stack>

        {/* xxs — 12px */}
        <Stack spacing={4}>
          <Typography variant="h6" color="text.primary">
            xxs — 12px
          </Typography>
          <Box sx={{ ...CONFIG, flexWrap: 'wrap' }}>
            <IconDisplay onlyIcon name="AccessibleIcon">
              <AccessibleIcon variant="xxs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="AdjustableDeskIcon">
              <AdjustableDeskIcon variant="xxs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ArrowDownIcon">
              <ArrowDownIcon variant="xxs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="BikeIcon">
              <BikeIcon variant="xxs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="BlankIcon">
              <BlankIcon variant="xxs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="BookmarkIcon">
              <BookmarkIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="CameraIcon">
              <CameraIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="ClockIcon">
              <ClockIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="CloseIcon">
              <CloseIcon variant="xxs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ControlPanelIcon">
              <ControlPanelIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="DeleteIcon">
              <DeleteIcon variant="xxs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="DeskIcon">
              <DeskIcon variant="xxs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="DisplayIcon">
              <DisplayIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="DropdownChevronDownIcon">
              <DropdownChevronDownIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="DropdownChevronDuoIcon">
              <DropdownChevronDuoIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="DropdownChevronUpIcon">
              <DropdownChevronUpIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="DualMonitorFilledIcon">
              <DualMonitorFilledIcon variant="xxs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="EarIcon">
              <EarIcon variant="xxs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ElectricVehicleChargingIcon">
              <ElectricVehicleChargingIcon variant="xxs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="FurnitureIcon">
              <FurnitureIcon variant="xxs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="LightsIcon">
              <LightsIcon variant="xxs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="LinkIcon">
              <LinkIcon variant="xxs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="LockerIcon">
              <LockerIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="MicIcon">
              <MicIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="MonitorFilledIcon">
              <MonitorFilledIcon variant="xxs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="MotorcycleFilledIcon">
              <MotorcycleFilledIcon variant="xxs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="NetworkIcon">
              <NetworkIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="OtherIcon">
              <OtherIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="ParkingIcon">
              <ParkingIcon variant="xxs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="PersonIcon">
              <PersonIcon variant="xxs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="PhoneIcon">
              <PhoneIcon variant="xxs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="PinLocationIcon">
              <PinLocationIcon variant="xxs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="PowerOutletFilledIcon">
              <PowerOutletFilledIcon variant="xxs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="PrivateIcon">
              <PrivateIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="ProjectorIcon">
              <ProjectorIcon variant="xxs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="RepeatIcon">
              <RepeatIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="RoomIcon">
              <RoomIcon variant="xxs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="RoomTempIcon">
              <RoomTempIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="SpeakerIcon">
              <SpeakerIcon variant="xxs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="StarIcon">
              <StarIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="WeatherProtectionFilledIcon">
              <WeatherProtectionFilledIcon variant="xxs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="WhiteboardIcon">
              <WhiteboardIcon variant="xxs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="WirelessChargingFilledIcon">
              <WirelessChargingFilledIcon variant="xxs" />
            </IconDisplay>
          </Box>
        </Stack>

        {/* xs — 16px */}
        <Stack spacing={4}>
          <Typography variant="h6" color="text.primary">
            xs — 16px
          </Typography>
          <Box sx={{ ...CONFIG, flexWrap: 'wrap' }}>
            <IconDisplay onlyIcon name="AccessibleIcon">
              <AccessibleIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="AddIcon">
              <AddIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="AddScreenTvIcon">
              <AddScreenTvIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="AdjustableDeskIcon">
              <AdjustableDeskIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ArrowLeftIcon">
              <ArrowLeftIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ArrowsMaximizeIcon">
              <ArrowsMaximizeIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ArrowsMinimizeIcon">
              <ArrowsMinimizeIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="ArrowsMoveIcon">
              <ArrowsMoveIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ArrowUpRightIcon">
              <ArrowUpRightIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="AudioFileIcon">
              <AudioFileIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="AudioLibraryIcon">
              <AudioLibraryIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="AudioPolarityInversionIcon">
              <AudioPolarityInversionIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="BiampLaunchIcon">
              <BiampLaunchIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="BikeIcon">
              <BikeIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="BlankIcon">
              <BlankIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="BlockIcon">
              <BlockIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="BuildingIcon">
              <BuildingIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="CalendarIcon">
              <CalendarIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="CeilingIcon">
              <CeilingIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="ChevronDownIcon">
              <ChevronDownIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ChevronFullLeftIcon">
              <ChevronFullLeftIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="ChevronFullRightIcon">
              <ChevronFullRightIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="ChevronLeftIcon">
              <ChevronLeftIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ChevronRightIcon">
              <ChevronRightIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ChevronUpIcon">
              <ChevronUpIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="CircleCheckIcon">
              <CircleCheckIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="CircleFilledIcon">
              <CircleFilledIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="CircleHalfIcon">
              <CircleHalfIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="CircleIcon">
              <CircleIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="ClipboardListIcon">
              <ClipboardListIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="ClockTimeIcon">
              <ClockTimeIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="CloseIcon">
              <CloseIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="CloudIcon">
              <CloudIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="CloudNoConnectionIcon">
              <CloudNoConnectionIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="CloudUploadIcon">
              <CloudUploadIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="CodeIcon">
              <CodeIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="CollapseTreeviewIcon">
              <CollapseTreeviewIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="ColumnsIcon">
              <ColumnsIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="CommandFileIcon">
              <CommandFileIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="CopyIcon">
              <CopyIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="DeleteIcon">
              <DeleteIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="DesignFileIcon">
              <DesignFileIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="DeskIcon">
              <DeskIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="DeviceSpeakerIcon">
              <DeviceSpeakerIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="DistanceIcon">
              <DistanceIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="DoorRoomIcon">
              <DoorRoomIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="DownloadIcon">
              <DownloadIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="DragIcon">
              <DragIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="DualMonitorFilledIcon">
              <DualMonitorFilledIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="EarIcon">
              <EarIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="EditIcon">
              <EditIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ElectricVehicleChargingIcon">
              <ElectricVehicleChargingIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="EmailIcon">
              <EmailIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="EqualizerIcon">
              <EqualizerIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="ErrorCircleIcon">
              <ErrorCircleIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ExportIcon">
              <ExportIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ExternalLinkIcon">
              <ExternalLinkIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="EyeIcon">
              <EyeIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="EyeOffIcon">
              <EyeOffIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="FavoriteIcon">
              <FavoriteIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="FileIcon">
              <FileIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="FileReportIcon">
              <FileReportIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="FileTypeLogIcon">
              <FileTypeLogIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="FilterIcon">
              <FilterIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="FirmwareUpdateIcon">
              <FirmwareUpdateIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="FloorPlanIcon">
              <FloorPlanIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="FolderOpenIcon">
              <FolderOpenIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="FurnitureIcon">
              <FurnitureIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="GhostDeskIcon">
              <GhostDeskIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="GroupIcon">
              <GroupIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="InfoCircleIcon">
              <InfoCircleIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="LayoutSidebarCollapseIcon">
              <LayoutSidebarCollapseIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="LicencesIcon">
              <LicencesIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="LinkIcon">
              <LinkIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="LinkOffIcon">
              <LinkOffIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ListIcon">
              <ListIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="LoaderIcon">
              <LoaderIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="LockIcon">
              <LockIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="LockOpenIcon">
              <LockOpenIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="LoginIcon">
              <LoginIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="LogoutIcon">
              <LogoutIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="MapSiteIcon">
              <MapSiteIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="MapZoomIcon">
              <MapZoomIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="MicrophoneIcon">
              <MicrophoneIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="MinusIcon">
              <MinusIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="MonitorFilledIcon">
              <MonitorFilledIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="MotorcycleFilledIcon">
              <MotorcycleFilledIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="MusicNoteIcon">
              <MusicNoteIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="NoiseCancellingPanelsQuietZoneIcon">
              <NoiseCancellingPanelsQuietZoneIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ParkingAltIcon">
              <ParkingAltIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ParkingIcon">
              <ParkingIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="PauseIcon">
              <PauseIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="PersonIcon">
              <PersonIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="PhotoIcon">
              <PhotoIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="PinFilledIcon">
              <PinFilledIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="PinLocationIcon">
              <PinLocationIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="PinOutlinedIcon">
              <PinOutlinedIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="PlaybackSpeedIcon">
              <PlaybackSpeedIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="PowerOutletFilledIcon">
              <PowerOutletFilledIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="RefreshIcon">
              <RefreshIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="RocketLaunchIcon">
              <RocketLaunchIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="RotateIcon">
              <RotateIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="RulerIcon">
              <RulerIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="SearchIcon">
              <SearchIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="SelectIcon">
              <SelectIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="SendIcon">
              <SendIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="SettingsIcon">
              <SettingsIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ShareIcon">
              <ShareIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="SoundIcon">
              <SoundIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="SourceIcon">
              <SourceIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="SpeakerFilledIcon">
              <SpeakerFilledIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="SpeakerMinimumVolumeFilledIcon">
              <SpeakerMinimumVolumeFilledIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="SpeakerOffFilledIcon">
              <SpeakerOffFilledIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="SquareRoundedPlusIcon">
              <SquareRoundedPlusIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="StopIcon">
              <StopIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="SupportIcon">
              <SupportIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="UploadIcon">
              <UploadIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="UsersIcon">
              <UsersIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="UsersPlusSigninIcon">
              <UsersPlusSigninIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="VideoCameraIcon">
              <VideoCameraIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="VideoProcessorFilledIcon">
              <VideoProcessorFilledIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="VideoProcessorIcon">
              <VideoProcessorIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="WarningTriangleIcon">
              <WarningTriangleIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="WeatherProtectionFilledIcon">
              <WeatherProtectionFilledIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="WirelessChargingFilledIcon">
              <WirelessChargingFilledIcon variant="xs" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ZoneIcon">
              <ZoneIcon />
            </IconDisplay>
          </Box>
        </Stack>

        {/* sm — 20px */}
        <Stack spacing={4}>
          <Typography variant="h6" color="text.primary">
            sm — 20px
          </Typography>
          <Box sx={{ ...CONFIG, flexWrap: 'wrap' }}>
            <IconDisplay onlyIcon name="AccessibleIcon">
              <AccessibleIcon variant="sm" />
            </IconDisplay>
            <IconDisplay onlyIcon name="AdjustableDeskIcon">
              <AdjustableDeskIcon variant="sm" />
            </IconDisplay>
            <IconDisplay onlyIcon name="AppleIcon">
              <AppleIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="BikeIcon">
              <BikeIcon variant="sm" />
            </IconDisplay>
            <IconDisplay onlyIcon name="CircleCheckIcon">
              <CircleCheckIcon variant="sm" />
            </IconDisplay>
            <IconDisplay onlyIcon name="DeskAltIcon">
              <DeskAltIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="DeskIcon">
              <DeskIcon variant="sm" />
            </IconDisplay>
            <IconDisplay onlyIcon name="DualMonitorFilledIcon">
              <DualMonitorFilledIcon variant="sm" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ElectricVehicleChargingIcon">
              <ElectricVehicleChargingIcon variant="sm" />
            </IconDisplay>
            <IconDisplay onlyIcon name="EmailIcon">
              <EmailIcon variant="sm" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ErrorCircleIcon">
              <ErrorCircleIcon variant="sm" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ForgotPasswordIcon">
              <ForgotPasswordIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="InfoCircleIcon">
              <InfoCircleIcon variant="sm" />
            </IconDisplay>
            <IconDisplay onlyIcon name="MonitorFilledIcon">
              <MonitorFilledIcon variant="sm" />
            </IconDisplay>
            <IconDisplay onlyIcon name="MotorcycleFilledIcon">
              <MotorcycleFilledIcon variant="sm" />
            </IconDisplay>
            <IconDisplay onlyIcon name="MsTeamsIcon">
              <MsTeamsIcon variant="sm" />
            </IconDisplay>
            <IconDisplay onlyIcon name="NoiseCancellingPanelsQuietZoneIcon">
              <NoiseCancellingPanelsQuietZoneIcon variant="sm" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ParkingIcon">
              <ParkingIcon variant="sm" />
            </IconDisplay>
            <IconDisplay onlyIcon name="PhoneIcon">
              <PhoneIcon variant="sm" />
            </IconDisplay>
            <IconDisplay onlyIcon name="PhotoIcon">
              <PhotoIcon variant="sm" />
            </IconDisplay>
            <IconDisplay onlyIcon name="PowerOutletFilledIcon">
              <PowerOutletFilledIcon variant="sm" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ReceptionIcon">
              <ReceptionIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="RestroomIcon">
              <RestroomIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="RoomIcon">
              <RoomIcon variant="sm" />
            </IconDisplay>
            <IconDisplay onlyIcon name="WarningTriangleIcon">
              <WarningTriangleIcon variant="sm" />
            </IconDisplay>
            <IconDisplay onlyIcon name="WeatherProtectionFilledIcon">
              <WeatherProtectionFilledIcon variant="sm" />
            </IconDisplay>
            <IconDisplay onlyIcon name="WirelessChargingFilledIcon">
              <WirelessChargingFilledIcon variant="sm" />
            </IconDisplay>
          </Box>
        </Stack>

        {/* md — 24px */}
        <Stack spacing={4}>
          <Typography variant="h6" color="text.primary">
            md — 24px
          </Typography>
          <Box sx={{ ...CONFIG, flexWrap: 'wrap' }}>
            <IconDisplay onlyIcon name="AddIcon">
              <AddIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="AddPhotoIcon">
              <AddPhotoIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="ArrowDownIcon">
              <ArrowDownIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ArrowLeftIcon">
              <ArrowLeftIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ArrowRightIcon">
              <ArrowRightIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ArrowsMaximizeIcon">
              <ArrowsMaximizeIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ArrowsMoveIcon">
              <ArrowsMoveIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ArrowUpIcon">
              <ArrowUpIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="AudioLibraryIcon">
              <AudioLibraryIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="AudioPolarityInversionIcon">
              <AudioPolarityInversionIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="AutoFitFilledIcon">
              <AutoFitFilledIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="AutoFitIcon">
              <AutoFitIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="BlankIcon">
              <BlankIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="BuildingIcon">
              <BuildingIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="CalendarAddIcon">
              <CalendarAddIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="CalendarIcon">
              <CalendarIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ChevronDownIcon">
              <ChevronDownIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ChevronLeftIcon">
              <ChevronLeftIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ChevronRightIcon">
              <ChevronRightIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ChevronUpIcon">
              <ChevronUpIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="CircleCheckIcon">
              <CircleCheckIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="CircleStopIcon">
              <CircleStopIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="ClockTimeIcon">
              <ClockTimeIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="CloseIcon">
              <CloseIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="CloudIcon">
              <CloudIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="CloudNoConnectionIcon">
              <CloudNoConnectionIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ColumnsIcon">
              <ColumnsIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ContrastIcon">
              <ContrastIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="CopyIcon">
              <CopyIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="CursorIcon">
              <CursorIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="DefineIcon">
              <DefineIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="DeleteIcon">
              <DeleteIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="DeskIcon">
              <DeskIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="DeskSolidIcon">
              <DeskSolidIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="DoorRoomIcon">
              <DoorRoomIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="DownloadIcon">
              <DownloadIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="EditIcon">
              <EditIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="EmailIcon">
              <EmailIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ErrorCircleIcon">
              <ErrorCircleIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ExportIcon">
              <ExportIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ExternalLinkIcon">
              <ExternalLinkIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="EyeIcon">
              <EyeIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="EyeOffIcon">
              <EyeOffIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="FileReportIcon">
              <FileReportIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="FileTypeLogIcon">
              <FileTypeLogIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="FileTypePdfIcon">
              <FileTypePdfIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="FilterIcon">
              <FilterIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="FirmwareUpdateIcon">
              <FirmwareUpdateIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="FloorPlanIcon">
              <FloorPlanIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="FollowScreenFilledIcon">
              <FollowScreenFilledIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="FollowScreenIcon">
              <FollowScreenIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="InfoCircleIcon">
              <InfoCircleIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="InvertIcon">
              <InvertIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="LayoutSidebarRightCollapseIcon">
              <LayoutSidebarRightCollapseIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="LicencesIcon">
              <LicencesIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="LinkIcon">
              <LinkIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="LinkOffIcon">
              <LinkOffIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ListIcon">
              <ListIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="LockIcon">
              <LockIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="LoginIcon">
              <LoginIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="LogoutIcon">
              <LogoutIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="MapSiteIcon">
              <MapSiteIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="MapZoomIcon">
              <MapZoomIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="MaximizeIcon">
              <MaximizeIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="MicrophoneIcon">
              <MicrophoneIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="MicrophoneOffIcon">
              <MicrophoneOffIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="MinimizeIcon">
              <MinimizeIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="MinusIcon">
              <MinusIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="MobildFilterIcon">
              <MobildFilterIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="MoreIcon">
              <MoreIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="MsTeamsIcon">
              <MsTeamsIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ParkingAltIcon">
              <ParkingAltIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ParkingIcon">
              <ParkingIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="PauseIcon">
              <PauseIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="PersonIcon">
              <PersonIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="PhotoIcon">
              <PhotoIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="PinLocationIcon">
              <PinLocationIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="PlayAnnouncementIcon">
              <PlayAnnouncementIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="PlaybackSpeedIcon">
              <PlaybackSpeedIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="QrIcon">
              <QrIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="QuestionmarkIcon">
              <QuestionmarkIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="QueueAnnouncementIcon">
              <QueueAnnouncementIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="RefreshIcon">
              <RefreshIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="RocketLaunchIcon">
              <RocketLaunchIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="RoomSolidIcon">
              <RoomSolidIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="SaveIcon">
              <SaveIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="SearchIcon">
              <SearchIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="SettingsIcon">
              <SettingsIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ShareIcon">
              <ShareIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="SourceIcon">
              <SourceIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="SpeakerFilledIcon">
              <SpeakerFilledIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="SpeakerIcon">
              <SpeakerIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="SpeakerMinimumVolumeFilledIcon">
              <SpeakerMinimumVolumeFilledIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="SpeakerOffFilledIcon">
              <SpeakerOffFilledIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="SpeakerOffIcon">
              <SpeakerOffIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="SquareRoundedArrowRightFilledIcon">
              <SquareRoundedArrowRightFilledIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="SquareRoundedArrowRightIcon">
              <SquareRoundedArrowRightIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="SquareRoundedPlusIcon">
              <SquareRoundedPlusIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="StopIcon">
              <StopIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="UploadIcon">
              <UploadIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="UsersPlusSigninIcon">
              <UsersPlusSigninIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="VideoIcon">
              <VideoIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="WarningTriangleIcon">
              <WarningTriangleIcon variant="md" />
            </IconDisplay>
            <IconDisplay onlyIcon name="WifiIcon">
              <WifiIcon variant="md" />
            </IconDisplay>
          </Box>
        </Stack>

        {/* lg — 32px */}
        <Stack spacing={4}>
          <Typography variant="h6" color="text.primary">
            lg — 32px
          </Typography>
          <Box sx={{ ...CONFIG, flexWrap: 'wrap' }}>
            <IconDisplay onlyIcon name="ComputerIcon">
              <ComputerIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="ConditionerIcon">
              <ConditionerIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="FilterIcon">
              <FilterIcon variant="lg" />
            </IconDisplay>
            <IconDisplay onlyIcon name="LightsIcon">
              <LightsIcon variant="lg" />
            </IconDisplay>
            <IconDisplay onlyIcon name="PersonIcon">
              <PersonIcon variant="lg" />
            </IconDisplay>
            <IconDisplay onlyIcon name="PhoneIcon">
              <PhoneIcon variant="lg" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ProjectorIcon">
              <ProjectorIcon variant="lg" />
            </IconDisplay>
            <IconDisplay onlyIcon name="VideoConferenceIcon">
              <VideoConferenceIcon variant="lg" />
            </IconDisplay>
            <IconDisplay onlyIcon name="WhiteboardIcon">
              <WhiteboardIcon variant="lg" />
            </IconDisplay>
            <IconDisplay onlyIcon name="WifiIcon">
              <WifiIcon variant="lg" />
            </IconDisplay>
          </Box>
        </Stack>

        {/* xl — 40px */}
        <Stack spacing={4}>
          <Typography variant="h6" color="text.primary">
            xl — 40px
          </Typography>
          <Box sx={{ ...CONFIG, flexWrap: 'wrap' }}>
            <IconDisplay onlyIcon name="ArrowDownIcon">
              <ArrowDownIcon variant="xl" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ArrowLeftIcon">
              <ArrowLeftIcon variant="xl" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ArrowRightIcon">
              <ArrowRightIcon variant="xl" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ArrowUpIcon">
              <ArrowUpIcon variant="xl" />
            </IconDisplay>
          </Box>
        </Stack>

        {/* xxl — 56px */}
        <Stack spacing={4}>
          <Typography variant="h6" color="text.primary">
            xxl — 56px
          </Typography>
          <Box sx={{ ...CONFIG, flexWrap: 'wrap' }}>
            <IconDisplay onlyIcon name="CloudNoConnectionIcon">
              <CloudNoConnectionIcon variant="xxl" />
            </IconDisplay>
            <IconDisplay onlyIcon name="DeskIcon">
              <DeskIcon variant="xxl" />
            </IconDisplay>
            <IconDisplay onlyIcon name="FileDesignIcon">
              <FileDesignIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="FocusModeIcon">
              <FocusModeIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="NoCardIcon">
              <NoCardIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="NoResultsIcon">
              <NoResultsIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="ParkingIcon">
              <ParkingIcon variant="xxl" />
            </IconDisplay>
            <IconDisplay onlyIcon name="RoomIcon">
              <RoomIcon variant="xxl" />
            </IconDisplay>
            <IconDisplay onlyIcon name="ServiceNotReachableIcon">
              <ServiceNotReachableIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="TeamMeetingIcon">
              <TeamMeetingIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="VideoConferenceIcon">
              <VideoConferenceIcon variant="xxl" />
            </IconDisplay>
            <IconDisplay onlyIcon name="WarningTriangleIcon">
              <WarningTriangleIcon variant="xxl" />
            </IconDisplay>
            <IconDisplay onlyIcon name="WorkshopIcon">
              <WorkshopIcon />
            </IconDisplay>
          </Box>
        </Stack>

        {/* xxxl — 72px */}
        <Stack spacing={4}>
          <Typography variant="h6" color="text.primary">
            xxxl — 72px
          </Typography>
          <Box sx={{ ...CONFIG, flexWrap: 'wrap' }}>
            <IconDisplay onlyIcon name="GlobeIcon">
              <GlobeIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="RoomHubIcon">
              <RoomHubIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="TouchDisplayIcon">
              <TouchDisplayIcon />
            </IconDisplay>
            <IconDisplay onlyIcon name="WifiEnlargedIcon">
              <WifiEnlargedIcon />
            </IconDisplay>
          </Box>
        </Stack>
      </Stack>
    </Box>
  ),
};

/**
 * Icons rendered at multiple sizes to verify they scale correctly.
 */
export const Sizes: Story = {
  args: { iconColor: undefined },
  render: ({ iconColor }) => (
    <Box sx={{ color: iconColor || 'inherit' }}>
      <Stack spacing={3}>
        <Typography variant="h3">Icons at Different Sizes</Typography>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          {[14, 16, 20, 24, 32, 48].map((size) => (
            <Box key={size} sx={{ textAlign: 'center' }}>
              <SuccessStatusIcon sx={{ width: size, height: size }} />
              <Typography variant="caption" display="block">
                {size}px
              </Typography>
            </Box>
          ))}
        </Box>
      </Stack>
    </Box>
  ),
};
