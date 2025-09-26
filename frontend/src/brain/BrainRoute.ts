import {
  AcceptInvitationData,
  AcceptInvitationRequest,
  AddAttendeeData,
  AgendaItemCreate,
  AgendaItemUpdate,
  ArchiveDocumentData,
  AssignRoleRequest,
  AssignUserRoleData,
  AttendeeCreate,
  AttendeeUpdate,
  BoardTaskCreate,
  BoardTaskUpdate,
  BulkCreateTranslationsData,
  BulkTranslationRequest,
  CancelInvitationData,
  ChatMessageCreate,
  CheckHealthData,
  CreateAgendaItemData,
  CreateBoardTaskData,
  CreateDocumentData,
  CreateInvitationData,
  CreateInvitationRequest,
  CreateMeetingData,
  CreateTranslationData,
  CreateUpdateData,
  DeleteAgendaItemData,
  DeleteBoardTaskData,
  DeleteDocumentData,
  DeleteMeetingData,
  DeleteTranslationData,
  DeleteUpdateData,
  DocumentCreate,
  GetAvailableLanguagesData,
  GetAvailableRolesData,
  GetBoardTaskData,
  GetChatMessagesData,
  GetInvitationDetailsData,
  GetMeetingData,
  GetOnlineUsersData,
  GetTaskCategoriesData,
  GetTranslationCategoriesData,
  GetTranslationsByLanguageData,
  GetUserPermissionsData,
  ListBoardTasksData,
  ListDocumentsData,
  ListMeetingsData,
  ListPendingInvitationsData,
  ListTranslationsData,
  ListUpdatesData,
  ListUsersByRoleData,
  ListUsersData,
  MeetingCreate,
  MeetingUpdate,
  RemoveAttendeeData,
  RemoveUserRoleData,
  SendChatMessageData,
  TranslationRequest,
  TranslationUpdate,
  UnarchiveDocumentData,
  UpdateAgendaItemData,
  UpdateAttendeeData,
  UpdateBoardTaskData,
  UpdateCreate,
  UpdateMeetingData,
  UpdateTranslationData,
} from "./data-contracts";

export namespace Brain {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * @description List documents with optional search and category filtering
   * @tags dbtn/module:documents, dbtn/hasAuth
   * @name list_documents
   * @summary List Documents
   * @request GET:/routes/documents
   */
  export namespace list_documents {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Search */
      search?: string | null;
      /** Category */
      category?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListDocumentsData;
  }

  /**
   * @description Create a new document
   * @tags dbtn/module:documents, dbtn/hasAuth
   * @name create_document
   * @summary Create Document
   * @request POST:/routes/documents
   */
  export namespace create_document {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = DocumentCreate;
    export type RequestHeaders = {};
    export type ResponseBody = CreateDocumentData;
  }

  /**
   * @description Delete a document
   * @tags dbtn/module:documents, dbtn/hasAuth
   * @name delete_document
   * @summary Delete Document
   * @request DELETE:/routes/documents/{document_id}
   */
  export namespace delete_document {
    export type RequestParams = {
      /** Document Id */
      documentId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteDocumentData;
  }

  /**
   * @description Archive a document
   * @tags dbtn/module:documents, dbtn/hasAuth
   * @name archive_document
   * @summary Archive Document
   * @request PATCH:/routes/documents/{document_id}/archive
   */
  export namespace archive_document {
    export type RequestParams = {
      /** Document Id */
      documentId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ArchiveDocumentData;
  }

  /**
   * @description Unarchive a document
   * @tags dbtn/module:documents, dbtn/hasAuth
   * @name unarchive_document
   * @summary Unarchive Document
   * @request PATCH:/routes/documents/{document_id}/unarchive
   */
  export namespace unarchive_document {
    export type RequestParams = {
      /** Document Id */
      documentId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = UnarchiveDocumentData;
  }

  /**
   * @description List updates ordered by most recent first
   * @tags dbtn/module:updates, dbtn/hasAuth
   * @name list_updates
   * @summary List Updates
   * @request GET:/routes/updates
   */
  export namespace list_updates {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListUpdatesData;
  }

  /**
   * @description Create a new board update
   * @tags dbtn/module:updates, dbtn/hasAuth
   * @name create_update
   * @summary Create Update
   * @request POST:/routes/updates
   */
  export namespace create_update {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = UpdateCreate;
    export type RequestHeaders = {};
    export type ResponseBody = CreateUpdateData;
  }

  /**
   * @description Delete an update
   * @tags dbtn/module:updates, dbtn/hasAuth
   * @name delete_update
   * @summary Delete Update
   * @request DELETE:/routes/updates/{update_id}
   */
  export namespace delete_update {
    export type RequestParams = {
      /** Update Id */
      updateId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteUpdateData;
  }

  /**
   * @description Get chat message history
   * @tags dbtn/module:chat, dbtn/hasAuth
   * @name get_chat_messages
   * @summary Get Chat Messages
   * @request GET:/routes/chat/messages
   */
  export namespace get_chat_messages {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetChatMessagesData;
  }

  /**
   * @description Send a chat message
   * @tags dbtn/module:chat, dbtn/hasAuth
   * @name send_chat_message
   * @summary Send Chat Message
   * @request POST:/routes/chat/messages
   */
  export namespace send_chat_message {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ChatMessageCreate;
    export type RequestHeaders = {};
    export type ResponseBody = SendChatMessageData;
  }

  /**
   * @description Get list of currently online users
   * @tags dbtn/module:chat, dbtn/hasAuth
   * @name get_online_users
   * @summary Get Online Users
   * @request GET:/routes/chat/online-users
   */
  export namespace get_online_users {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetOnlineUsersData;
  }

  /**
   * @description List meetings with filtering options
   * @tags dbtn/module:meetings, dbtn/hasAuth
   * @name list_meetings
   * @summary List Meetings
   * @request GET:/routes/meetings
   */
  export namespace list_meetings {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListMeetingsData;
  }

  /**
   * @description Create a new meeting
   * @tags dbtn/module:meetings, dbtn/hasAuth
   * @name create_meeting
   * @summary Create Meeting
   * @request POST:/routes/meetings
   */
  export namespace create_meeting {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = MeetingCreate;
    export type RequestHeaders = {};
    export type ResponseBody = CreateMeetingData;
  }

  /**
   * @description Get a specific meeting with agenda items and attendees
   * @tags dbtn/module:meetings, dbtn/hasAuth
   * @name get_meeting
   * @summary Get Meeting
   * @request GET:/routes/meetings/{meeting_id}
   */
  export namespace get_meeting {
    export type RequestParams = {
      /** Meeting Id */
      meetingId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetMeetingData;
  }

  /**
   * @description Update a meeting
   * @tags dbtn/module:meetings, dbtn/hasAuth
   * @name update_meeting
   * @summary Update Meeting
   * @request PUT:/routes/meetings/{meeting_id}
   */
  export namespace update_meeting {
    export type RequestParams = {
      /** Meeting Id */
      meetingId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = MeetingUpdate;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateMeetingData;
  }

  /**
   * @description Delete a meeting
   * @tags dbtn/module:meetings, dbtn/hasAuth
   * @name delete_meeting
   * @summary Delete Meeting
   * @request DELETE:/routes/meetings/{meeting_id}
   */
  export namespace delete_meeting {
    export type RequestParams = {
      /** Meeting Id */
      meetingId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteMeetingData;
  }

  /**
   * @description Create a new agenda item
   * @tags dbtn/module:meetings, dbtn/hasAuth
   * @name create_agenda_item
   * @summary Create Agenda Item
   * @request POST:/routes/meetings/{meeting_id}/agenda-items
   */
  export namespace create_agenda_item {
    export type RequestParams = {
      /** Meeting Id */
      meetingId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = AgendaItemCreate;
    export type RequestHeaders = {};
    export type ResponseBody = CreateAgendaItemData;
  }

  /**
   * @description Update an agenda item
   * @tags dbtn/module:meetings, dbtn/hasAuth
   * @name update_agenda_item
   * @summary Update Agenda Item
   * @request PUT:/routes/meetings/{meeting_id}/agenda-items/{item_id}
   */
  export namespace update_agenda_item {
    export type RequestParams = {
      /** Meeting Id */
      meetingId: string;
      /** Item Id */
      itemId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = AgendaItemUpdate;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateAgendaItemData;
  }

  /**
   * @description Delete an agenda item
   * @tags dbtn/module:meetings, dbtn/hasAuth
   * @name delete_agenda_item
   * @summary Delete Agenda Item
   * @request DELETE:/routes/meetings/{meeting_id}/agenda-items/{item_id}
   */
  export namespace delete_agenda_item {
    export type RequestParams = {
      /** Meeting Id */
      meetingId: string;
      /** Item Id */
      itemId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteAgendaItemData;
  }

  /**
   * @description Add an attendee to a meeting
   * @tags dbtn/module:meetings, dbtn/hasAuth
   * @name add_attendee
   * @summary Add Attendee
   * @request POST:/routes/meetings/{meeting_id}/attendees
   */
  export namespace add_attendee {
    export type RequestParams = {
      /** Meeting Id */
      meetingId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = AttendeeCreate;
    export type RequestHeaders = {};
    export type ResponseBody = AddAttendeeData;
  }

  /**
   * @description Update an attendee
   * @tags dbtn/module:meetings, dbtn/hasAuth
   * @name update_attendee
   * @summary Update Attendee
   * @request PUT:/routes/meetings/{meeting_id}/attendees/{attendee_id}
   */
  export namespace update_attendee {
    export type RequestParams = {
      /** Meeting Id */
      meetingId: string;
      /** Attendee Id */
      attendeeId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = AttendeeUpdate;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateAttendeeData;
  }

  /**
   * @description Remove an attendee from a meeting
   * @tags dbtn/module:meetings, dbtn/hasAuth
   * @name remove_attendee
   * @summary Remove Attendee
   * @request DELETE:/routes/meetings/{meeting_id}/attendees/{attendee_id}
   */
  export namespace remove_attendee {
    export type RequestParams = {
      /** Meeting Id */
      meetingId: string;
      /** Attendee Id */
      attendeeId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RemoveAttendeeData;
  }

  /**
   * @description Get list of all available language codes
   * @tags dbtn/module:translations, dbtn/hasAuth
   * @name get_available_languages
   * @summary Get Available Languages
   * @request GET:/routes/translations/languages
   */
  export namespace get_available_languages {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAvailableLanguagesData;
  }

  /**
   * @description Get list of all translation categories
   * @tags dbtn/module:translations, dbtn/hasAuth
   * @name get_translation_categories
   * @summary Get Translation Categories
   * @request GET:/routes/translations/categories
   */
  export namespace get_translation_categories {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetTranslationCategoriesData;
  }

  /**
   * @description Get all translations for a specific language as key-value pairs
   * @tags dbtn/module:translations, dbtn/hasAuth
   * @name get_translations_by_language
   * @summary Get Translations By Language
   * @request GET:/routes/translations/by-language/{language_code}
   */
  export namespace get_translations_by_language {
    export type RequestParams = {
      /** Language Code */
      languageCode: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetTranslationsByLanguageData;
  }

  /**
   * @description List all translations with optional filters
   * @tags dbtn/module:translations, dbtn/hasAuth
   * @name list_translations
   * @summary List Translations
   * @request GET:/routes/translations/
   */
  export namespace list_translations {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Language Code */
      language_code?: string | null;
      /** Category */
      category?: string | null;
      /** Search */
      search?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListTranslationsData;
  }

  /**
   * @description Create a new translation
   * @tags dbtn/module:translations, dbtn/hasAuth
   * @name create_translation
   * @summary Create Translation
   * @request POST:/routes/translations/
   */
  export namespace create_translation {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = TranslationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateTranslationData;
  }

  /**
   * @description Update an existing translation
   * @tags dbtn/module:translations, dbtn/hasAuth
   * @name update_translation
   * @summary Update Translation
   * @request PUT:/routes/translations/{translation_id}
   */
  export namespace update_translation {
    export type RequestParams = {
      /** Translation Id */
      translationId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = TranslationUpdate;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateTranslationData;
  }

  /**
   * @description Delete a translation
   * @tags dbtn/module:translations, dbtn/hasAuth
   * @name delete_translation
   * @summary Delete Translation
   * @request DELETE:/routes/translations/{translation_id}
   */
  export namespace delete_translation {
    export type RequestParams = {
      /** Translation Id */
      translationId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteTranslationData;
  }

  /**
   * @description Create multiple translations for a language at once
   * @tags dbtn/module:translations, dbtn/hasAuth
   * @name bulk_create_translations
   * @summary Bulk Create Translations
   * @request POST:/routes/translations/bulk
   */
  export namespace bulk_create_translations {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BulkTranslationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = BulkCreateTranslationsData;
  }

  /**
   * @description Get current user's permissions and role.
   * @tags dbtn/module:user_management, dbtn/hasAuth
   * @name get_user_permissions
   * @summary Get User Permissions
   * @request GET:/routes/user-management/permissions
   */
  export namespace get_user_permissions {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserPermissionsData;
  }

  /**
   * @description List all users with their roles (admin only).
   * @tags dbtn/module:user_management, dbtn/hasAuth
   * @name list_users
   * @summary List Users
   * @request GET:/routes/user-management/users
   */
  export namespace list_users {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListUsersData;
  }

  /**
   * @description List users by specific role (admin only).
   * @tags dbtn/module:user_management, dbtn/hasAuth
   * @name list_users_by_role
   * @summary List Users By Role
   * @request GET:/routes/user-management/users/role/{role_name}
   */
  export namespace list_users_by_role {
    export type RequestParams = {
      /** Role Name */
      roleName: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListUsersByRoleData;
  }

  /**
   * @description Assign or update a user's role (admin only).
   * @tags dbtn/module:user_management, dbtn/hasAuth
   * @name assign_user_role
   * @summary Assign User Role
   * @request POST:/routes/user-management/assign-role
   */
  export namespace assign_user_role {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AssignRoleRequest;
    export type RequestHeaders = {};
    export type ResponseBody = AssignUserRoleData;
  }

  /**
   * @description Remove a user's role, reverting them to 'others' (admin only).
   * @tags dbtn/module:user_management, dbtn/hasAuth
   * @name remove_user_role
   * @summary Remove User Role
   * @request DELETE:/routes/user-management/remove-role/{user_id}
   */
  export namespace remove_user_role {
    export type RequestParams = {
      /** User Id */
      userId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RemoveUserRoleData;
  }

  /**
   * @description List all pending invitations (admin only).
   * @tags dbtn/module:user_management, dbtn/hasAuth
   * @name list_pending_invitations
   * @summary List Pending Invitations
   * @request GET:/routes/user-management/invitations
   */
  export namespace list_pending_invitations {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListPendingInvitationsData;
  }

  /**
   * @description Create a new user invitation (admin only).
   * @tags dbtn/module:user_management, dbtn/hasAuth
   * @name create_invitation
   * @summary Create Invitation
   * @request POST:/routes/user-management/invitations
   */
  export namespace create_invitation {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateInvitationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateInvitationData;
  }

  /**
   * @description Cancel a pending invitation (admin only).
   * @tags dbtn/module:user_management, dbtn/hasAuth
   * @name cancel_invitation
   * @summary Cancel Invitation
   * @request DELETE:/routes/user-management/invitations/{invitation_id}
   */
  export namespace cancel_invitation {
    export type RequestParams = {
      /** Invitation Id */
      invitationId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CancelInvitationData;
  }

  /**
   * @description Accept an invitation and assign role to current user.
   * @tags dbtn/module:user_management, dbtn/hasAuth
   * @name accept_invitation
   * @summary Accept Invitation
   * @request POST:/routes/user-management/accept-invitation
   */
  export namespace accept_invitation {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AcceptInvitationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = AcceptInvitationData;
  }

  /**
   * @description Get invitation details for display (open endpoint for invitation acceptance).
   * @tags dbtn/module:user_management, dbtn/hasAuth
   * @name get_invitation_details
   * @summary Get Invitation Details
   * @request GET:/routes/user-management/invitation/{token}
   */
  export namespace get_invitation_details {
    export type RequestParams = {
      /** Token */
      token: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetInvitationDetailsData;
  }

  /**
   * @description Get list of available roles.
   * @tags dbtn/module:user_management, dbtn/hasAuth
   * @name get_available_roles
   * @summary Get Available Roles
   * @request GET:/routes/user-management/roles
   */
  export namespace get_available_roles {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAvailableRolesData;
  }

  /**
   * @description Get list of task categories in use
   * @tags dbtn/module:tasks, dbtn/hasAuth
   * @name get_task_categories
   * @summary Get Task Categories
   * @request GET:/routes/tasks/categories
   */
  export namespace get_task_categories {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetTaskCategoriesData;
  }

  /**
   * @description List board tasks with filtering options
   * @tags dbtn/module:tasks, dbtn/hasAuth
   * @name list_board_tasks
   * @summary List Board Tasks
   * @request GET:/routes/tasks
   */
  export namespace list_board_tasks {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListBoardTasksData;
  }

  /**
   * @description Create a new board task
   * @tags dbtn/module:tasks, dbtn/hasAuth
   * @name create_board_task
   * @summary Create Board Task
   * @request POST:/routes/tasks
   */
  export namespace create_board_task {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BoardTaskCreate;
    export type RequestHeaders = {};
    export type ResponseBody = CreateBoardTaskData;
  }

  /**
   * @description Get a specific board task with its activity history
   * @tags dbtn/module:tasks, dbtn/hasAuth
   * @name get_board_task
   * @summary Get Board Task
   * @request GET:/routes/tasks/{task_id}
   */
  export namespace get_board_task {
    export type RequestParams = {
      /** Task Id */
      taskId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetBoardTaskData;
  }

  /**
   * @description Update a board task
   * @tags dbtn/module:tasks, dbtn/hasAuth
   * @name update_board_task
   * @summary Update Board Task
   * @request PUT:/routes/tasks/{task_id}
   */
  export namespace update_board_task {
    export type RequestParams = {
      /** Task Id */
      taskId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = BoardTaskUpdate;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateBoardTaskData;
  }

  /**
   * @description Delete a board task
   * @tags dbtn/module:tasks, dbtn/hasAuth
   * @name delete_board_task
   * @summary Delete Board Task
   * @request DELETE:/routes/tasks/{task_id}
   */
  export namespace delete_board_task {
    export type RequestParams = {
      /** Task Id */
      taskId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteBoardTaskData;
  }
}
