/** AcceptInvitationRequest */
export interface AcceptInvitationRequest {
  /** Invitation Token */
  invitation_token: string;
}

/** AgendaItem */
export interface AgendaItem {
  /** Id */
  id: string;
  /** Meeting Id */
  meeting_id: string;
  /** Title */
  title: string;
  /** Description */
  description: string | null;
  /** Item Type */
  item_type: string;
  /** Priority */
  priority: string;
  /** Time Allocated */
  time_allocated: number | null;
  /** Order Index */
  order_index: number;
  /** Presenter */
  presenter: string | null;
  /** Documents Needed */
  documents_needed: string[] | null;
  /** Pre Reading Required */
  pre_reading_required: boolean;
  /** Decision Required */
  decision_required: boolean;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
}

/** AgendaItemCreate */
export interface AgendaItemCreate {
  /**
   * Title
   * @maxLength 255
   */
  title: string;
  /** Description */
  description?: string | null;
  /**
   * Item Type
   * @default "discussion"
   * @pattern ^(information|discussion|decision|action)$
   */
  item_type?: string;
  /**
   * Priority
   * @default "medium"
   * @pattern ^(low|medium|high|urgent)$
   */
  priority?: string;
  /** Time Allocated */
  time_allocated?: number | null;
  /**
   * Order Index
   * @min 0
   */
  order_index: number;
  /** Presenter */
  presenter?: string | null;
  /** Documents Needed */
  documents_needed?: string[] | null;
  /**
   * Pre Reading Required
   * @default false
   */
  pre_reading_required?: boolean;
  /**
   * Decision Required
   * @default false
   */
  decision_required?: boolean;
}

/** AgendaItemUpdate */
export interface AgendaItemUpdate {
  /** Title */
  title?: string | null;
  /** Description */
  description?: string | null;
  /** Item Type */
  item_type?: string | null;
  /** Priority */
  priority?: string | null;
  /** Time Allocated */
  time_allocated?: number | null;
  /** Order Index */
  order_index?: number | null;
  /** Presenter */
  presenter?: string | null;
  /** Documents Needed */
  documents_needed?: string[] | null;
  /** Pre Reading Required */
  pre_reading_required?: boolean | null;
  /** Decision Required */
  decision_required?: boolean | null;
}

/** AssignRoleRequest */
export interface AssignRoleRequest {
  /** User Id */
  user_id: string;
  /** Role Name */
  role_name: string;
}

/** Attendee */
export interface Attendee {
  /** Id */
  id: string;
  /** Meeting Id */
  meeting_id: string;
  /** User Id */
  user_id: string | null;
  /** Name */
  name: string;
  /** Email */
  email: string | null;
  /** Role */
  role: string;
  /** Attendance Status */
  attendance_status: string;
  /** Rsvp Date */
  rsvp_date: string | null;
  /** Notes */
  notes: string | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
}

/** AttendeeCreate */
export interface AttendeeCreate {
  /** User Id */
  user_id?: string | null;
  /**
   * Name
   * @maxLength 255
   */
  name: string;
  /** Email */
  email?: string | null;
  /**
   * Role
   * @default "member"
   * @pattern ^(chair|secretary|member|observer|guest)$
   */
  role?: string;
}

/** AttendeeUpdate */
export interface AttendeeUpdate {
  /** Name */
  name?: string | null;
  /** Email */
  email?: string | null;
  /** Role */
  role?: string | null;
  /** Attendance Status */
  attendance_status?: string | null;
  /** Notes */
  notes?: string | null;
}

/** BoardTask */
export interface BoardTask {
  /** Id */
  id: string;
  /** Title */
  title: string;
  /** Description */
  description: string | null;
  /** Status */
  status: string;
  /** Priority */
  priority: string;
  /** Category */
  category: string | null;
  /** Due Date */
  due_date: string | null;
  /** Assigned To */
  assigned_to: string | null;
  /** Assigned To Name */
  assigned_to_name: string | null;
  /** Created By */
  created_by: string;
  /** Created By Name */
  created_by_name: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
  /** Completed At */
  completed_at: string | null;
  /** Is Overdue */
  is_overdue: boolean;
  /**
   * Board Restricted
   * @default false
   */
  board_restricted?: boolean;
}

/** BoardTaskActivity */
export interface BoardTaskActivity {
  /** Id */
  id: string;
  /** Task Id */
  task_id: string;
  /** Action */
  action: string;
  /** Field Changed */
  field_changed: string | null;
  /** Old Value */
  old_value: string | null;
  /** New Value */
  new_value: string | null;
  /** Performed By */
  performed_by: string;
  /** Performed By Name */
  performed_by_name: string;
  /**
   * Performed At
   * @format date-time
   */
  performed_at: string;
}

/** BoardTaskCreate */
export interface BoardTaskCreate {
  /**
   * Title
   * @maxLength 255
   */
  title: string;
  /** Description */
  description?: string | null;
  /**
   * Priority
   * @default "medium"
   * @pattern ^(low|medium|high|urgent)$
   */
  priority?: string;
  /** Category */
  category?: string | null;
  /** Due Date */
  due_date?: string | null;
  /** Assigned To */
  assigned_to?: string | null;
  /** Assigned To Name */
  assigned_to_name?: string | null;
  /**
   * Board Restricted
   * @default false
   */
  board_restricted?: boolean;
}

/** BoardTaskResponse */
export interface BoardTaskResponse {
  task: BoardTask;
  /** Activities */
  activities: BoardTaskActivity[];
}

/** BoardTaskUpdate */
export interface BoardTaskUpdate {
  /** Title */
  title?: string | null;
  /** Description */
  description?: string | null;
  /** Status */
  status?: string | null;
  /** Priority */
  priority?: string | null;
  /** Category */
  category?: string | null;
  /** Due Date */
  due_date?: string | null;
  /** Assigned To */
  assigned_to?: string | null;
  /** Assigned To Name */
  assigned_to_name?: string | null;
  /** Board Restricted */
  board_restricted?: boolean | null;
}

/** BoardTasksResponse */
export interface BoardTasksResponse {
  /** Tasks */
  tasks: BoardTask[];
  /** Total */
  total: number;
  /** Overdue Count */
  overdue_count: number;
}

/** BulkTranslationRequest */
export interface BulkTranslationRequest {
  /** Language Code */
  language_code: string;
  /** Translations */
  translations: Record<string, string>;
  /** Category */
  category?: string | null;
}

/** ChatMessage */
export interface ChatMessage {
  /** Id */
  id: string;
  /** Content */
  content: string;
  /** User Id */
  user_id: string;
  /** Username */
  username: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
}

/** ChatMessageCreate */
export interface ChatMessageCreate {
  /** Content */
  content: string;
}

/** ChatMessagesResponse */
export interface ChatMessagesResponse {
  /** Messages */
  messages: ChatMessage[];
  /** Total */
  total: number;
}

/** CreateInvitationRequest */
export interface CreateInvitationRequest {
  /** Email */
  email: string;
  /** Role Name */
  role_name: string;
}

/** DocumentCreate */
export interface DocumentCreate {
  /** Title */
  title: string;
  /** Url */
  url: string;
  /** Category */
  category: string;
}

/** DocumentListResponse */
export interface DocumentListResponse {
  /** Documents */
  documents: DocumentResponse[];
  /** Total */
  total: number;
}

/** DocumentResponse */
export interface DocumentResponse {
  /** Id */
  id: string;
  /** Title */
  title: string;
  /** Url */
  url: string;
  /** Category */
  category: string;
  /** Created By */
  created_by: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** InvitationResponse */
export interface InvitationResponse {
  /** Id */
  id: string;
  /** Email */
  email: string;
  /** Role Name */
  role_name: string;
  /** Invited By */
  invited_by: string;
  /** Invited By Name */
  invited_by_name: string;
  /** Invitation Token */
  invitation_token: string;
  /** Status */
  status: string;
  /**
   * Expires At
   * @format date-time
   */
  expires_at: string;
  /** Accepted At */
  accepted_at?: string | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
}

/** Meeting */
export interface Meeting {
  /** Id */
  id: string;
  /** Title */
  title: string;
  /** Description */
  description: string | null;
  /** Meeting Type */
  meeting_type: string;
  /** Status */
  status: string;
  /**
   * Start Date
   * @format date-time
   */
  start_date: string;
  /** End Date */
  end_date: string | null;
  /** Location */
  location: string | null;
  /** Meeting Link */
  meeting_link: string | null;
  /** Agenda Locked */
  agenda_locked: boolean;
  /** Minutes Finalized */
  minutes_finalized: boolean;
  /** Created By */
  created_by: string;
  /** Created By Name */
  created_by_name: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
  /** Attendee Count */
  attendee_count: number;
  /** Agenda Item Count */
  agenda_item_count: number;
}

/** MeetingCreate */
export interface MeetingCreate {
  /**
   * Title
   * @maxLength 255
   */
  title: string;
  /** Description */
  description?: string | null;
  /**
   * Meeting Type
   * @default "regular"
   * @pattern ^(regular|committee|special|annual|emergency)$
   */
  meeting_type?: string;
  /**
   * Start Date
   * @format date-time
   */
  start_date: string;
  /** End Date */
  end_date?: string | null;
  /** Location */
  location?: string | null;
  /** Meeting Link */
  meeting_link?: string | null;
}

/** MeetingDetailResponse */
export interface MeetingDetailResponse {
  meeting: Meeting;
  /** Agenda Items */
  agenda_items: AgendaItem[];
  /** Attendees */
  attendees: Attendee[];
}

/** MeetingUpdate */
export interface MeetingUpdate {
  /** Title */
  title?: string | null;
  /** Description */
  description?: string | null;
  /** Meeting Type */
  meeting_type?: string | null;
  /** Status */
  status?: string | null;
  /** Start Date */
  start_date?: string | null;
  /** End Date */
  end_date?: string | null;
  /** Location */
  location?: string | null;
  /** Meeting Link */
  meeting_link?: string | null;
  /** Agenda Locked */
  agenda_locked?: boolean | null;
  /** Minutes Finalized */
  minutes_finalized?: boolean | null;
}

/** MeetingsResponse */
export interface MeetingsResponse {
  /** Meetings */
  meetings: Meeting[];
  /** Total */
  total: number;
  /** Upcoming Count */
  upcoming_count: number;
  /** In Progress Count */
  in_progress_count: number;
}

/** TranslationRequest */
export interface TranslationRequest {
  /** Translation Key */
  translation_key: string;
  /** Language Code */
  language_code: string;
  /** Translation Value */
  translation_value: string;
  /** Category */
  category?: string | null;
  /** Description */
  description?: string | null;
}

/** TranslationResponse */
export interface TranslationResponse {
  /** Id */
  id: number;
  /** Translation Key */
  translation_key: string;
  /** Language Code */
  language_code: string;
  /** Translation Value */
  translation_value: string;
  /** Category */
  category: string | null;
  /** Description */
  description: string | null;
  /** Created At */
  created_at: string;
  /** Updated At */
  updated_at: string;
  /** Created By */
  created_by: string | null;
  /** Updated By */
  updated_by: string | null;
}

/** TranslationUpdate */
export interface TranslationUpdate {
  /** Translation Value */
  translation_value: string;
  /** Category */
  category?: string | null;
  /** Description */
  description?: string | null;
}

/** TranslationsByLanguageResponse */
export interface TranslationsByLanguageResponse {
  /** Language Code */
  language_code: string;
  /** Translations */
  translations: Record<string, string>;
}

/** UpdateCreate */
export interface UpdateCreate {
  /** Title */
  title: string;
  /** Content Md */
  content_md: string;
}

/** UpdateListResponse */
export interface UpdateListResponse {
  /** Updates */
  updates: UpdateResponse[];
  /** Total */
  total: number;
}

/** UpdateResponse */
export interface UpdateResponse {
  /** Id */
  id: string;
  /** Title */
  title: string;
  /** Content Md */
  content_md: string;
  /** Created By */
  created_by: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
}

/** UserListResponse */
export interface UserListResponse {
  /** Users */
  users: UserRoleResponse[];
  /** Total Count */
  total_count: number;
}

/** UserPermissionsResponse */
export interface UserPermissionsResponse {
  /** User Id */
  user_id: string;
  /** Role */
  role: string;
  /** Can Access Admin Features */
  can_access_admin_features: boolean;
  /** Can Access Board Restricted Content */
  can_access_board_restricted_content: boolean;
  /** Can Manage Users */
  can_manage_users: boolean;
  /** Can Create Board Restricted Content */
  can_create_board_restricted_content: boolean;
  /** Can Invite Users */
  can_invite_users: boolean;
}

/** UserRoleResponse */
export interface UserRoleResponse {
  /** User Id */
  user_id: string;
  /** Role Name */
  role_name: string;
  /** Assigned By */
  assigned_by?: string | null;
  /** Assigned By Name */
  assigned_by_name?: string | null;
  /**
   * Assigned At
   * @format date-time
   */
  assigned_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
  /** Name */
  name?: string | null;
  /** Email */
  email?: string | null;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

export type CheckHealthData = HealthResponse;

export interface ListDocumentsParams {
  /** Search */
  search?: string | null;
  /** Category */
  category?: string | null;
}

export type ListDocumentsData = DocumentListResponse;

export type ListDocumentsError = HTTPValidationError;

export type CreateDocumentData = DocumentResponse;

export type CreateDocumentError = HTTPValidationError;

export interface DeleteDocumentParams {
  /** Document Id */
  documentId: string;
}

export type DeleteDocumentData = any;

export type DeleteDocumentError = HTTPValidationError;

export interface ArchiveDocumentParams {
  /** Document Id */
  documentId: string;
}

export type ArchiveDocumentData = any;

export type ArchiveDocumentError = HTTPValidationError;

export interface UnarchiveDocumentParams {
  /** Document Id */
  documentId: string;
}

export type UnarchiveDocumentData = any;

export type UnarchiveDocumentError = HTTPValidationError;

export type ListUpdatesData = UpdateListResponse;

export type CreateUpdateData = UpdateResponse;

export type CreateUpdateError = HTTPValidationError;

export interface DeleteUpdateParams {
  /** Update Id */
  updateId: string;
}

export type DeleteUpdateData = any;

export type DeleteUpdateError = HTTPValidationError;

export interface GetChatMessagesParams {
  /**
   * Limit
   * @default 50
   */
  limit?: number;
  /**
   * Offset
   * @default 0
   */
  offset?: number;
}

export type GetChatMessagesData = ChatMessagesResponse;

export type GetChatMessagesError = HTTPValidationError;

export type SendChatMessageData = ChatMessage;

export type SendChatMessageError = HTTPValidationError;

export type GetOnlineUsersData = any;

export interface ListMeetingsParams {
  /** Status */
  status?: string | null;
  /** Meeting Type */
  meeting_type?: string | null;
  /**
   * Upcoming Only
   * @default false
   */
  upcoming_only?: boolean;
  /**
   * Limit
   * @max 100
   * @default 50
   */
  limit?: number;
  /**
   * Offset
   * @min 0
   * @default 0
   */
  offset?: number;
}

export type ListMeetingsData = MeetingsResponse;

export type ListMeetingsError = HTTPValidationError;

export type CreateMeetingData = Meeting;

export type CreateMeetingError = HTTPValidationError;

export interface GetMeetingParams {
  /** Meeting Id */
  meetingId: string;
}

export type GetMeetingData = MeetingDetailResponse;

export type GetMeetingError = HTTPValidationError;

export interface UpdateMeetingParams {
  /** Meeting Id */
  meetingId: string;
}

export type UpdateMeetingData = Meeting;

export type UpdateMeetingError = HTTPValidationError;

export interface DeleteMeetingParams {
  /** Meeting Id */
  meetingId: string;
}

export type DeleteMeetingData = any;

export type DeleteMeetingError = HTTPValidationError;

export interface CreateAgendaItemParams {
  /** Meeting Id */
  meetingId: string;
}

export type CreateAgendaItemData = AgendaItem;

export type CreateAgendaItemError = HTTPValidationError;

export interface UpdateAgendaItemParams {
  /** Meeting Id */
  meetingId: string;
  /** Item Id */
  itemId: string;
}

export type UpdateAgendaItemData = AgendaItem;

export type UpdateAgendaItemError = HTTPValidationError;

export interface DeleteAgendaItemParams {
  /** Meeting Id */
  meetingId: string;
  /** Item Id */
  itemId: string;
}

export type DeleteAgendaItemData = any;

export type DeleteAgendaItemError = HTTPValidationError;

export interface AddAttendeeParams {
  /** Meeting Id */
  meetingId: string;
}

export type AddAttendeeData = Attendee;

export type AddAttendeeError = HTTPValidationError;

export interface UpdateAttendeeParams {
  /** Meeting Id */
  meetingId: string;
  /** Attendee Id */
  attendeeId: string;
}

export type UpdateAttendeeData = Attendee;

export type UpdateAttendeeError = HTTPValidationError;

export interface RemoveAttendeeParams {
  /** Meeting Id */
  meetingId: string;
  /** Attendee Id */
  attendeeId: string;
}

export type RemoveAttendeeData = any;

export type RemoveAttendeeError = HTTPValidationError;

/** Response Get Available Languages */
export type GetAvailableLanguagesData = string[];

/** Response Get Translation Categories */
export type GetTranslationCategoriesData = string[];

export interface GetTranslationsByLanguageParams {
  /** Language Code */
  languageCode: string;
}

export type GetTranslationsByLanguageData = TranslationsByLanguageResponse;

export type GetTranslationsByLanguageError = HTTPValidationError;

export interface ListTranslationsParams {
  /** Language Code */
  language_code?: string | null;
  /** Category */
  category?: string | null;
  /** Search */
  search?: string | null;
}

/** Response List Translations */
export type ListTranslationsData = TranslationResponse[];

export type ListTranslationsError = HTTPValidationError;

export type CreateTranslationData = TranslationResponse;

export type CreateTranslationError = HTTPValidationError;

export interface UpdateTranslationParams {
  /** Translation Id */
  translationId: number;
}

export type UpdateTranslationData = TranslationResponse;

export type UpdateTranslationError = HTTPValidationError;

export interface DeleteTranslationParams {
  /** Translation Id */
  translationId: number;
}

/** Response Delete Translation */
export type DeleteTranslationData = Record<string, any>;

export type DeleteTranslationError = HTTPValidationError;

/** Response Bulk Create Translations */
export type BulkCreateTranslationsData = Record<string, any>;

export type BulkCreateTranslationsError = HTTPValidationError;

export type GetUserPermissionsData = UserPermissionsResponse;

export type ListUsersData = UserListResponse;

export interface ListUsersByRoleParams {
  /** Role Name */
  roleName: string;
}

export type ListUsersByRoleData = UserListResponse;

export type ListUsersByRoleError = HTTPValidationError;

export type AssignUserRoleData = any;

export type AssignUserRoleError = HTTPValidationError;

export interface RemoveUserRoleParams {
  /** User Id */
  userId: string;
}

export type RemoveUserRoleData = any;

export type RemoveUserRoleError = HTTPValidationError;

/** Response List Pending Invitations */
export type ListPendingInvitationsData = InvitationResponse[];

/** Response Create Invitation */
export type CreateInvitationData = Record<string, string>;

export type CreateInvitationError = HTTPValidationError;

export interface CancelInvitationParams {
  /** Invitation Id */
  invitationId: string;
}

export type CancelInvitationData = any;

export type CancelInvitationError = HTTPValidationError;

export type AcceptInvitationData = any;

export type AcceptInvitationError = HTTPValidationError;

export interface GetInvitationDetailsParams {
  /** Token */
  token: string;
}

export type GetInvitationDetailsData = any;

export type GetInvitationDetailsError = HTTPValidationError;

/** Response Get Available Roles */
export type GetAvailableRolesData = string[];

export type GetTaskCategoriesData = any;

export interface ListBoardTasksParams {
  /** Status */
  status?: string | null;
  /** Priority */
  priority?: string | null;
  /** Assigned To */
  assigned_to?: string | null;
  /** Category */
  category?: string | null;
  /**
   * Overdue Only
   * @default false
   */
  overdue_only?: boolean;
  /**
   * Limit
   * @max 100
   * @default 50
   */
  limit?: number;
  /**
   * Offset
   * @min 0
   * @default 0
   */
  offset?: number;
}

export type ListBoardTasksData = BoardTasksResponse;

export type ListBoardTasksError = HTTPValidationError;

export type CreateBoardTaskData = BoardTask;

export type CreateBoardTaskError = HTTPValidationError;

export interface GetBoardTaskParams {
  /** Task Id */
  taskId: string;
}

export type GetBoardTaskData = BoardTaskResponse;

export type GetBoardTaskError = HTTPValidationError;

export interface UpdateBoardTaskParams {
  /** Task Id */
  taskId: string;
}

export type UpdateBoardTaskData = BoardTask;

export type UpdateBoardTaskError = HTTPValidationError;

export interface DeleteBoardTaskParams {
  /** Task Id */
  taskId: string;
}

export type DeleteBoardTaskData = any;

export type DeleteBoardTaskError = HTTPValidationError;
