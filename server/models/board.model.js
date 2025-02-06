const { Schema } = mongoose;

const defaultColors = [
    "#ffffff",
    "#007bff",
    "#28a745",
    "#ffc107",
    "#dc3545",
    "#4ECDC4",
    "#556270",
    "#aa51c4",
    "#D35400",
    "#2574A9",
    "#26A65B",
    "#F5D76E",
    "#663399",
    "#E74C3C"
];

const boardSchema = new Schema(
    {
        projectId: {
            type: Schema.Types.ObjectId,
            ref: "Project",
        },
        title: {
            type: String,
            required: true,
        },
        colors: {
            type: [String],
            default: defaultColors,
        },
        color: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Board", boardSchema);