export class ActionButtonsModel {
    addRow: () => void;
    deleteRow: (id) => void;
    editRow: (id) => void;
    deleteDisabled: boolean;
    editDisabled: boolean;
    addDisabled: boolean;
}