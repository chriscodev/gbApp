/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

export class MultipleTableColumns {
    header: string;
    key: string;
    visible: boolean;
    subclass?: boolean;
    translateField?: boolean;
    showOnline?: boolean;
    showHex?: boolean;
    showDate?: boolean;
    showDataCount?: boolean;
    function?: any;
    elementFunction?: any;
    showImg?: any;
    showChecker?: any;
}

export class TableSingleColumn {
    header: string;
    key: string;
}

// TODO add rest of the images if this design is used for all buttons
export enum ImageType {
    success = '<i class="fa fa-check-circle fa-3x" style="color:green" aria-hidden="true"></i>',
    confirm = '<i class="fa fa-exclamation-triangle fa-2x" style="color:red" aria-hidden="true"></i>',
    add = '<i class="fa fa-plus"></i>',
    addfile = '<i class="fa fa-plus"></i>',
    addm = '<i class="fa fa-plus"></i>',
    addip = '<i class="fa fa-plus"></i>',
    delete = '<i class="fa fa-trash"></i>',
    edit = '<i class="fa fa-edit"></i>',
    clear = '<i class="fa fa-eraser"></i>',
    view = '<i class="fa fa-search"></i>',
    import = '<i class="fa fa-file-import"></i>',
    export = '<i class="fa fa-file-export"></i>',
    status = '<i class="fa fa-search"></i>',
    ingest = '<i class="fa fa-file-upload"></i>',
    backup = '<i class="fa fa-search"></i>',
    restore = '<i class="fa fa-upload"></i>',
    disable = '<i class="fa fa-times"></i>',
    enable = '<i class="fa fa-check"></i>',
    encode = '<i class="fa fa-laptop-code"></i>',
    updateZip = '<i class="fa fa-file-upload"></i>',
    verify = '<i class="fa fa-id-badge"></i>',
}

export enum ButtonType {
    ADD = 'Add',
    ADDFILE = 'Add File',
    DELETE = 'Remove',
    EDIT = 'Edit',
    BACKUP = 'Backup',
    RESTORE = 'Restore',
    STATUS = 'Status',
    VIEW = 'View',
    CLEAR = 'Clear',
    INGEST = 'Ingest',
    DISABLE = 'Disable',
    ENABLE = 'Enable',
    IMPORT = 'Import',
    EXPORT = 'Export',
    ENCODE = 'Encode',
    UPDATEROW = 'UpdateRow',
    ADDIP = 'Add IP Stream',
    ADDM = 'Add Media Stream',
    VERIFY = 'Verify',
}

export class ButtonTypes {
    name: string;
    imgSrc: ImageType;
    supportsMultiSelect?: boolean;
    alwaysEnabled?: boolean;
    requiresServerId?: boolean;
    restricted?: boolean;
    disable?: boolean;
}

export class ConfirmMessageDialog {
    dialogTitle: string;
    imageSrc?: ImageType;
    message: string;
}

export enum ActionMessage {
    ADD = 'Add',
    ADDFILE = 'AddFile',
    DELETE = 'Delete',
    EDIT = 'Edit',
    DIRTY = 'Dirty',
    CLEAN = 'Clean',
    UPDATE_ROW = 'UpdateRow',
    ENABLE_DISABLE = 'EnableDisable',
    IMPORT = 'Import',
    EXPORT = 'Export',
    STATUS = 'Status',
    ENCODE = 'Encode',
    INGEST = 'Ingest',
    VIEW = 'View',
    CLICKROW = 'ClickRow',
    CLOSE = 'Close',
    ADDIP = 'AddIPStream',
    ADDMEDIA = 'AddMediaStream',
    UPDATE_ZIP = 'UpdateZip',
    VERIFY = 'Verify',
    CLEAR = 'Clear',
    BACKUP = 'Backup',
    RESTORE = 'Restore',
    NULL = 'Notdefined'
}

export type ButtonTypeToActionMessageMap = {
    [key in ButtonType]: ActionMessage;
};
export const buttonTypeToActionMessageMap: ButtonTypeToActionMessageMap = {
    [ButtonType.ADD]: ActionMessage.ADD,
    [ButtonType.DELETE]: ActionMessage.DELETE,
    [ButtonType.EDIT]: ActionMessage.EDIT,
    [ButtonType.VIEW]: ActionMessage.VIEW,
    [ButtonType.VERIFY]: ActionMessage.VERIFY,
    [ButtonType.INGEST]: ActionMessage.INGEST,
    [ButtonType.ENCODE]: ActionMessage.ENCODE,
    [ButtonType.IMPORT]: ActionMessage.IMPORT,
    [ButtonType.EXPORT]: ActionMessage.EXPORT,
    [ButtonType.CLEAR]: ActionMessage.DELETE,
    [ButtonType.BACKUP]: ActionMessage.BACKUP,
    [ButtonType.RESTORE]: ActionMessage.RESTORE,
    [ButtonType.ADDFILE]: ActionMessage.ADDFILE,
    [ButtonType.UPDATEROW]: ActionMessage.ENABLE_DISABLE,
    [ButtonType.STATUS]: ActionMessage.STATUS,
    [ButtonType.ENABLE]: ActionMessage.NULL, // verify this usage if needed
    [ButtonType.DISABLE]: ActionMessage.NULL, // verify this usage if needed
    [ButtonType.ADDIP]: ActionMessage.ADDIP, // verify this usage if needed
    [ButtonType.ADDM]: ActionMessage.ADDMEDIA, // verify this usage if needed
};


