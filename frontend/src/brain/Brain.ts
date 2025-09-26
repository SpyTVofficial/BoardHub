import {
  AcceptInvitationData,
  AcceptInvitationError,
  AcceptInvitationRequest,
  AddAttendeeData,
  AddAttendeeError,
  AddAttendeeParams,
  AgendaItemCreate,
  AgendaItemUpdate,
  ArchiveDocumentData,
  ArchiveDocumentError,
  ArchiveDocumentParams,
  AssignRoleRequest,
  AssignUserRoleData,
  AssignUserRoleError,
  AttendeeCreate,
  AttendeeUpdate,
  BoardTaskCreate,
  BoardTaskUpdate,
  BulkCreateTranslationsData,
  BulkCreateTranslationsError,
  BulkTranslationRequest,
  CancelInvitationData,
  CancelInvitationError,
  CancelInvitationParams,
  ChatMessageCreate,
  CheckHealthData,
  CreateAgendaItemData,
  CreateAgendaItemError,
  CreateAgendaItemParams,
  CreateBoardTaskData,
  CreateBoardTaskError,
  CreateDocumentData,
  CreateDocumentError,
  CreateInvitationData,
  CreateInvitationError,
  CreateInvitationRequest,
  CreateMeetingData,
  CreateMeetingError,
  CreateTranslationData,
  CreateTranslationError,
  CreateUpdateData,
  CreateUpdateError,
  DeleteAgendaItemData,
  DeleteAgendaItemError,
  DeleteAgendaItemParams,
  DeleteBoardTaskData,
  DeleteBoardTaskError,
  DeleteBoardTaskParams,
  DeleteDocumentData,
  DeleteDocumentError,
  DeleteDocumentParams,
  DeleteMeetingData,
  DeleteMeetingError,
  DeleteMeetingParams,
  DeleteTranslationData,
  DeleteTranslationError,
  DeleteTranslationParams,
  DeleteUpdateData,
  DeleteUpdateError,
  DeleteUpdateParams,
  DocumentCreate,
  GetAvailableLanguagesData,
  GetAvailableRolesData,
  GetBoardTaskData,
  GetBoardTaskError,
  GetBoardTaskParams,
  GetChatMessagesData,
  GetChatMessagesError,
  GetChatMessagesParams,
  GetInvitationDetailsData,
  GetInvitationDetailsError,
  GetInvitationDetailsParams,
  GetMeetingData,
  GetMeetingError,
  GetMeetingParams,
  GetOnlineUsersData,
  GetTaskCategoriesData,
  GetTranslationCategoriesData,
  GetTranslationsByLanguageData,
  GetTranslationsByLanguageError,
  GetTranslationsByLanguageParams,
  GetUserPermissionsData,
  ListBoardTasksData,
  ListBoardTasksError,
  ListBoardTasksParams,
  ListDocumentsData,
  ListDocumentsError,
  ListDocumentsParams,
  ListMeetingsData,
  ListMeetingsError,
  ListMeetingsParams,
  ListPendingInvitationsData,
  ListTranslationsData,
  ListTranslationsError,
  ListTranslationsParams,
  ListUpdatesData,
  ListUsersByRoleData,
  ListUsersByRoleError,
  ListUsersByRoleParams,
  ListUsersData,
  MeetingCreate,
  MeetingUpdate,
  RemoveAttendeeData,
  RemoveAttendeeError,
  RemoveAttendeeParams,
  RemoveUserRoleData,
  RemoveUserRoleError,
  RemoveUserRoleParams,
  SendChatMessageData,
  SendChatMessageError,
  TranslationRequest,
  TranslationUpdate,
  UnarchiveDocumentData,
  UnarchiveDocumentError,
  UnarchiveDocumentParams,
  UpdateAgendaItemData,
  UpdateAgendaItemError,
  UpdateAgendaItemParams,
  UpdateAttendeeData,
  UpdateAttendeeError,
  UpdateAttendeeParams,
  UpdateBoardTaskData,
  UpdateBoardTaskError,
  UpdateBoardTaskParams,
  UpdateCreate,
  UpdateMeetingData,
  UpdateMeetingError,
  UpdateMeetingParams,
  UpdateTranslationData,
  UpdateTranslationError,
  UpdateTranslationParams,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Brain<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   *
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthData, any>({
      path: `/_healthz`,
      method: "GET",
      ...params,
    });

  /**
   * @description List documents with optional search and category filtering
   *
   * @tags dbtn/module:documents, dbtn/hasAuth
   * @name list_documents
   * @summary List Documents
   * @request GET:/routes/documents
   */
  list_documents = (query: ListDocumentsParams, params: RequestParams = {}) =>
    this.request<ListDocumentsData, ListDocumentsError>({
      path: `/routes/documents`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Create a new document
   *
   * @tags dbtn/module:documents, dbtn/hasAuth
   * @name create_document
   * @summary Create Document
   * @request POST:/routes/documents
   */
  create_document = (data: DocumentCreate, params: RequestParams = {}) =>
    this.request<CreateDocumentData, CreateDocumentError>({
      path: `/routes/documents`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete a document
   *
   * @tags dbtn/module:documents, dbtn/hasAuth
   * @name delete_document
   * @summary Delete Document
   * @request DELETE:/routes/documents/{document_id}
   */
  delete_document = ({ documentId, ...query }: DeleteDocumentParams, params: RequestParams = {}) =>
    this.request<DeleteDocumentData, DeleteDocumentError>({
      path: `/routes/documents/${documentId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Archive a document
   *
   * @tags dbtn/module:documents, dbtn/hasAuth
   * @name archive_document
   * @summary Archive Document
   * @request PATCH:/routes/documents/{document_id}/archive
   */
  archive_document = ({ documentId, ...query }: ArchiveDocumentParams, params: RequestParams = {}) =>
    this.request<ArchiveDocumentData, ArchiveDocumentError>({
      path: `/routes/documents/${documentId}/archive`,
      method: "PATCH",
      ...params,
    });

  /**
   * @description Unarchive a document
   *
   * @tags dbtn/module:documents, dbtn/hasAuth
   * @name unarchive_document
   * @summary Unarchive Document
   * @request PATCH:/routes/documents/{document_id}/unarchive
   */
  unarchive_document = ({ documentId, ...query }: UnarchiveDocumentParams, params: RequestParams = {}) =>
    this.request<UnarchiveDocumentData, UnarchiveDocumentError>({
      path: `/routes/documents/${documentId}/unarchive`,
      method: "PATCH",
      ...params,
    });

  /**
   * @description List updates ordered by most recent first
   *
   * @tags dbtn/module:updates, dbtn/hasAuth
   * @name list_updates
   * @summary List Updates
   * @request GET:/routes/updates
   */
  list_updates = (params: RequestParams = {}) =>
    this.request<ListUpdatesData, any>({
      path: `/routes/updates`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a new board update
   *
   * @tags dbtn/module:updates, dbtn/hasAuth
   * @name create_update
   * @summary Create Update
   * @request POST:/routes/updates
   */
  create_update = (data: UpdateCreate, params: RequestParams = {}) =>
    this.request<CreateUpdateData, CreateUpdateError>({
      path: `/routes/updates`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete an update
   *
   * @tags dbtn/module:updates, dbtn/hasAuth
   * @name delete_update
   * @summary Delete Update
   * @request DELETE:/routes/updates/{update_id}
   */
  delete_update = ({ updateId, ...query }: DeleteUpdateParams, params: RequestParams = {}) =>
    this.request<DeleteUpdateData, DeleteUpdateError>({
      path: `/routes/updates/${updateId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Get chat message history
   *
   * @tags dbtn/module:chat, dbtn/hasAuth
   * @name get_chat_messages
   * @summary Get Chat Messages
   * @request GET:/routes/chat/messages
   */
  get_chat_messages = (query: GetChatMessagesParams, params: RequestParams = {}) =>
    this.request<GetChatMessagesData, GetChatMessagesError>({
      path: `/routes/chat/messages`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Send a chat message
   *
   * @tags dbtn/module:chat, dbtn/hasAuth
   * @name send_chat_message
   * @summary Send Chat Message
   * @request POST:/routes/chat/messages
   */
  send_chat_message = (data: ChatMessageCreate, params: RequestParams = {}) =>
    this.request<SendChatMessageData, SendChatMessageError>({
      path: `/routes/chat/messages`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get list of currently online users
   *
   * @tags dbtn/module:chat, dbtn/hasAuth
   * @name get_online_users
   * @summary Get Online Users
   * @request GET:/routes/chat/online-users
   */
  get_online_users = (params: RequestParams = {}) =>
    this.request<GetOnlineUsersData, any>({
      path: `/routes/chat/online-users`,
      method: "GET",
      ...params,
    });

  /**
   * @description List meetings with filtering options
   *
   * @tags dbtn/module:meetings, dbtn/hasAuth
   * @name list_meetings
   * @summary List Meetings
   * @request GET:/routes/meetings
   */
  list_meetings = (query: ListMeetingsParams, params: RequestParams = {}) =>
    this.request<ListMeetingsData, ListMeetingsError>({
      path: `/routes/meetings`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Create a new meeting
   *
   * @tags dbtn/module:meetings, dbtn/hasAuth
   * @name create_meeting
   * @summary Create Meeting
   * @request POST:/routes/meetings
   */
  create_meeting = (data: MeetingCreate, params: RequestParams = {}) =>
    this.request<CreateMeetingData, CreateMeetingError>({
      path: `/routes/meetings`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get a specific meeting with agenda items and attendees
   *
   * @tags dbtn/module:meetings, dbtn/hasAuth
   * @name get_meeting
   * @summary Get Meeting
   * @request GET:/routes/meetings/{meeting_id}
   */
  get_meeting = ({ meetingId, ...query }: GetMeetingParams, params: RequestParams = {}) =>
    this.request<GetMeetingData, GetMeetingError>({
      path: `/routes/meetings/${meetingId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update a meeting
   *
   * @tags dbtn/module:meetings, dbtn/hasAuth
   * @name update_meeting
   * @summary Update Meeting
   * @request PUT:/routes/meetings/{meeting_id}
   */
  update_meeting = ({ meetingId, ...query }: UpdateMeetingParams, data: MeetingUpdate, params: RequestParams = {}) =>
    this.request<UpdateMeetingData, UpdateMeetingError>({
      path: `/routes/meetings/${meetingId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete a meeting
   *
   * @tags dbtn/module:meetings, dbtn/hasAuth
   * @name delete_meeting
   * @summary Delete Meeting
   * @request DELETE:/routes/meetings/{meeting_id}
   */
  delete_meeting = ({ meetingId, ...query }: DeleteMeetingParams, params: RequestParams = {}) =>
    this.request<DeleteMeetingData, DeleteMeetingError>({
      path: `/routes/meetings/${meetingId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Create a new agenda item
   *
   * @tags dbtn/module:meetings, dbtn/hasAuth
   * @name create_agenda_item
   * @summary Create Agenda Item
   * @request POST:/routes/meetings/{meeting_id}/agenda-items
   */
  create_agenda_item = (
    { meetingId, ...query }: CreateAgendaItemParams,
    data: AgendaItemCreate,
    params: RequestParams = {},
  ) =>
    this.request<CreateAgendaItemData, CreateAgendaItemError>({
      path: `/routes/meetings/${meetingId}/agenda-items`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Update an agenda item
   *
   * @tags dbtn/module:meetings, dbtn/hasAuth
   * @name update_agenda_item
   * @summary Update Agenda Item
   * @request PUT:/routes/meetings/{meeting_id}/agenda-items/{item_id}
   */
  update_agenda_item = (
    { meetingId, itemId, ...query }: UpdateAgendaItemParams,
    data: AgendaItemUpdate,
    params: RequestParams = {},
  ) =>
    this.request<UpdateAgendaItemData, UpdateAgendaItemError>({
      path: `/routes/meetings/${meetingId}/agenda-items/${itemId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete an agenda item
   *
   * @tags dbtn/module:meetings, dbtn/hasAuth
   * @name delete_agenda_item
   * @summary Delete Agenda Item
   * @request DELETE:/routes/meetings/{meeting_id}/agenda-items/{item_id}
   */
  delete_agenda_item = ({ meetingId, itemId, ...query }: DeleteAgendaItemParams, params: RequestParams = {}) =>
    this.request<DeleteAgendaItemData, DeleteAgendaItemError>({
      path: `/routes/meetings/${meetingId}/agenda-items/${itemId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Add an attendee to a meeting
   *
   * @tags dbtn/module:meetings, dbtn/hasAuth
   * @name add_attendee
   * @summary Add Attendee
   * @request POST:/routes/meetings/{meeting_id}/attendees
   */
  add_attendee = ({ meetingId, ...query }: AddAttendeeParams, data: AttendeeCreate, params: RequestParams = {}) =>
    this.request<AddAttendeeData, AddAttendeeError>({
      path: `/routes/meetings/${meetingId}/attendees`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Update an attendee
   *
   * @tags dbtn/module:meetings, dbtn/hasAuth
   * @name update_attendee
   * @summary Update Attendee
   * @request PUT:/routes/meetings/{meeting_id}/attendees/{attendee_id}
   */
  update_attendee = (
    { meetingId, attendeeId, ...query }: UpdateAttendeeParams,
    data: AttendeeUpdate,
    params: RequestParams = {},
  ) =>
    this.request<UpdateAttendeeData, UpdateAttendeeError>({
      path: `/routes/meetings/${meetingId}/attendees/${attendeeId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Remove an attendee from a meeting
   *
   * @tags dbtn/module:meetings, dbtn/hasAuth
   * @name remove_attendee
   * @summary Remove Attendee
   * @request DELETE:/routes/meetings/{meeting_id}/attendees/{attendee_id}
   */
  remove_attendee = ({ meetingId, attendeeId, ...query }: RemoveAttendeeParams, params: RequestParams = {}) =>
    this.request<RemoveAttendeeData, RemoveAttendeeError>({
      path: `/routes/meetings/${meetingId}/attendees/${attendeeId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Get list of all available language codes
   *
   * @tags dbtn/module:translations, dbtn/hasAuth
   * @name get_available_languages
   * @summary Get Available Languages
   * @request GET:/routes/translations/languages
   */
  get_available_languages = (params: RequestParams = {}) =>
    this.request<GetAvailableLanguagesData, any>({
      path: `/routes/translations/languages`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get list of all translation categories
   *
   * @tags dbtn/module:translations, dbtn/hasAuth
   * @name get_translation_categories
   * @summary Get Translation Categories
   * @request GET:/routes/translations/categories
   */
  get_translation_categories = (params: RequestParams = {}) =>
    this.request<GetTranslationCategoriesData, any>({
      path: `/routes/translations/categories`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get all translations for a specific language as key-value pairs
   *
   * @tags dbtn/module:translations, dbtn/hasAuth
   * @name get_translations_by_language
   * @summary Get Translations By Language
   * @request GET:/routes/translations/by-language/{language_code}
   */
  get_translations_by_language = (
    { languageCode, ...query }: GetTranslationsByLanguageParams,
    params: RequestParams = {},
  ) =>
    this.request<GetTranslationsByLanguageData, GetTranslationsByLanguageError>({
      path: `/routes/translations/by-language/${languageCode}`,
      method: "GET",
      ...params,
    });

  /**
   * @description List all translations with optional filters
   *
   * @tags dbtn/module:translations, dbtn/hasAuth
   * @name list_translations
   * @summary List Translations
   * @request GET:/routes/translations/
   */
  list_translations = (query: ListTranslationsParams, params: RequestParams = {}) =>
    this.request<ListTranslationsData, ListTranslationsError>({
      path: `/routes/translations/`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Create a new translation
   *
   * @tags dbtn/module:translations, dbtn/hasAuth
   * @name create_translation
   * @summary Create Translation
   * @request POST:/routes/translations/
   */
  create_translation = (data: TranslationRequest, params: RequestParams = {}) =>
    this.request<CreateTranslationData, CreateTranslationError>({
      path: `/routes/translations/`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Update an existing translation
   *
   * @tags dbtn/module:translations, dbtn/hasAuth
   * @name update_translation
   * @summary Update Translation
   * @request PUT:/routes/translations/{translation_id}
   */
  update_translation = (
    { translationId, ...query }: UpdateTranslationParams,
    data: TranslationUpdate,
    params: RequestParams = {},
  ) =>
    this.request<UpdateTranslationData, UpdateTranslationError>({
      path: `/routes/translations/${translationId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete a translation
   *
   * @tags dbtn/module:translations, dbtn/hasAuth
   * @name delete_translation
   * @summary Delete Translation
   * @request DELETE:/routes/translations/{translation_id}
   */
  delete_translation = ({ translationId, ...query }: DeleteTranslationParams, params: RequestParams = {}) =>
    this.request<DeleteTranslationData, DeleteTranslationError>({
      path: `/routes/translations/${translationId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Create multiple translations for a language at once
   *
   * @tags dbtn/module:translations, dbtn/hasAuth
   * @name bulk_create_translations
   * @summary Bulk Create Translations
   * @request POST:/routes/translations/bulk
   */
  bulk_create_translations = (data: BulkTranslationRequest, params: RequestParams = {}) =>
    this.request<BulkCreateTranslationsData, BulkCreateTranslationsError>({
      path: `/routes/translations/bulk`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get current user's permissions and role.
   *
   * @tags dbtn/module:user_management, dbtn/hasAuth
   * @name get_user_permissions
   * @summary Get User Permissions
   * @request GET:/routes/user-management/permissions
   */
  get_user_permissions = (params: RequestParams = {}) =>
    this.request<GetUserPermissionsData, any>({
      path: `/routes/user-management/permissions`,
      method: "GET",
      ...params,
    });

  /**
   * @description List all users with their roles (admin only).
   *
   * @tags dbtn/module:user_management, dbtn/hasAuth
   * @name list_users
   * @summary List Users
   * @request GET:/routes/user-management/users
   */
  list_users = (params: RequestParams = {}) =>
    this.request<ListUsersData, any>({
      path: `/routes/user-management/users`,
      method: "GET",
      ...params,
    });

  /**
   * @description List users by specific role (admin only).
   *
   * @tags dbtn/module:user_management, dbtn/hasAuth
   * @name list_users_by_role
   * @summary List Users By Role
   * @request GET:/routes/user-management/users/role/{role_name}
   */
  list_users_by_role = ({ roleName, ...query }: ListUsersByRoleParams, params: RequestParams = {}) =>
    this.request<ListUsersByRoleData, ListUsersByRoleError>({
      path: `/routes/user-management/users/role/${roleName}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Assign or update a user's role (admin only).
   *
   * @tags dbtn/module:user_management, dbtn/hasAuth
   * @name assign_user_role
   * @summary Assign User Role
   * @request POST:/routes/user-management/assign-role
   */
  assign_user_role = (data: AssignRoleRequest, params: RequestParams = {}) =>
    this.request<AssignUserRoleData, AssignUserRoleError>({
      path: `/routes/user-management/assign-role`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Remove a user's role, reverting them to 'others' (admin only).
   *
   * @tags dbtn/module:user_management, dbtn/hasAuth
   * @name remove_user_role
   * @summary Remove User Role
   * @request DELETE:/routes/user-management/remove-role/{user_id}
   */
  remove_user_role = ({ userId, ...query }: RemoveUserRoleParams, params: RequestParams = {}) =>
    this.request<RemoveUserRoleData, RemoveUserRoleError>({
      path: `/routes/user-management/remove-role/${userId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description List all pending invitations (admin only).
   *
   * @tags dbtn/module:user_management, dbtn/hasAuth
   * @name list_pending_invitations
   * @summary List Pending Invitations
   * @request GET:/routes/user-management/invitations
   */
  list_pending_invitations = (params: RequestParams = {}) =>
    this.request<ListPendingInvitationsData, any>({
      path: `/routes/user-management/invitations`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a new user invitation (admin only).
   *
   * @tags dbtn/module:user_management, dbtn/hasAuth
   * @name create_invitation
   * @summary Create Invitation
   * @request POST:/routes/user-management/invitations
   */
  create_invitation = (data: CreateInvitationRequest, params: RequestParams = {}) =>
    this.request<CreateInvitationData, CreateInvitationError>({
      path: `/routes/user-management/invitations`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Cancel a pending invitation (admin only).
   *
   * @tags dbtn/module:user_management, dbtn/hasAuth
   * @name cancel_invitation
   * @summary Cancel Invitation
   * @request DELETE:/routes/user-management/invitations/{invitation_id}
   */
  cancel_invitation = ({ invitationId, ...query }: CancelInvitationParams, params: RequestParams = {}) =>
    this.request<CancelInvitationData, CancelInvitationError>({
      path: `/routes/user-management/invitations/${invitationId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Accept an invitation and assign role to current user.
   *
   * @tags dbtn/module:user_management, dbtn/hasAuth
   * @name accept_invitation
   * @summary Accept Invitation
   * @request POST:/routes/user-management/accept-invitation
   */
  accept_invitation = (data: AcceptInvitationRequest, params: RequestParams = {}) =>
    this.request<AcceptInvitationData, AcceptInvitationError>({
      path: `/routes/user-management/accept-invitation`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get invitation details for display (open endpoint for invitation acceptance).
   *
   * @tags dbtn/module:user_management, dbtn/hasAuth
   * @name get_invitation_details
   * @summary Get Invitation Details
   * @request GET:/routes/user-management/invitation/{token}
   */
  get_invitation_details = ({ token, ...query }: GetInvitationDetailsParams, params: RequestParams = {}) =>
    this.request<GetInvitationDetailsData, GetInvitationDetailsError>({
      path: `/routes/user-management/invitation/${token}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get list of available roles.
   *
   * @tags dbtn/module:user_management, dbtn/hasAuth
   * @name get_available_roles
   * @summary Get Available Roles
   * @request GET:/routes/user-management/roles
   */
  get_available_roles = (params: RequestParams = {}) =>
    this.request<GetAvailableRolesData, any>({
      path: `/routes/user-management/roles`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get list of task categories in use
   *
   * @tags dbtn/module:tasks, dbtn/hasAuth
   * @name get_task_categories
   * @summary Get Task Categories
   * @request GET:/routes/tasks/categories
   */
  get_task_categories = (params: RequestParams = {}) =>
    this.request<GetTaskCategoriesData, any>({
      path: `/routes/tasks/categories`,
      method: "GET",
      ...params,
    });

  /**
   * @description List board tasks with filtering options
   *
   * @tags dbtn/module:tasks, dbtn/hasAuth
   * @name list_board_tasks
   * @summary List Board Tasks
   * @request GET:/routes/tasks
   */
  list_board_tasks = (query: ListBoardTasksParams, params: RequestParams = {}) =>
    this.request<ListBoardTasksData, ListBoardTasksError>({
      path: `/routes/tasks`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Create a new board task
   *
   * @tags dbtn/module:tasks, dbtn/hasAuth
   * @name create_board_task
   * @summary Create Board Task
   * @request POST:/routes/tasks
   */
  create_board_task = (data: BoardTaskCreate, params: RequestParams = {}) =>
    this.request<CreateBoardTaskData, CreateBoardTaskError>({
      path: `/routes/tasks`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get a specific board task with its activity history
   *
   * @tags dbtn/module:tasks, dbtn/hasAuth
   * @name get_board_task
   * @summary Get Board Task
   * @request GET:/routes/tasks/{task_id}
   */
  get_board_task = ({ taskId, ...query }: GetBoardTaskParams, params: RequestParams = {}) =>
    this.request<GetBoardTaskData, GetBoardTaskError>({
      path: `/routes/tasks/${taskId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update a board task
   *
   * @tags dbtn/module:tasks, dbtn/hasAuth
   * @name update_board_task
   * @summary Update Board Task
   * @request PUT:/routes/tasks/{task_id}
   */
  update_board_task = (
    { taskId, ...query }: UpdateBoardTaskParams,
    data: BoardTaskUpdate,
    params: RequestParams = {},
  ) =>
    this.request<UpdateBoardTaskData, UpdateBoardTaskError>({
      path: `/routes/tasks/${taskId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete a board task
   *
   * @tags dbtn/module:tasks, dbtn/hasAuth
   * @name delete_board_task
   * @summary Delete Board Task
   * @request DELETE:/routes/tasks/{task_id}
   */
  delete_board_task = ({ taskId, ...query }: DeleteBoardTaskParams, params: RequestParams = {}) =>
    this.request<DeleteBoardTaskData, DeleteBoardTaskError>({
      path: `/routes/tasks/${taskId}`,
      method: "DELETE",
      ...params,
    });
}
