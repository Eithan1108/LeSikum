import { Document, Schema, model, models } from "mongoose";


// Define NeuronTerm and NeuronGraph interfaces
export interface NeuronTerm {
    term: string;
    definition: string;
    relatedTerms: string[];
}

export interface NeuronGraph {
    [key: string]: NeuronTerm;
}

// Define ISummary interface
export interface ISummary extends Document {
    id: string;
    owner: string;
    title: string;
    description: string;
    content: string;
    views: number;
    likes: number;
    comments: string[];
    dateCreated: string;
    lastUpdated: string;
    author: string;
    tags: string[];
    neuronGraph: NeuronGraph;
    path: string[];
    isPrivate?: boolean;
    fileId: string;
}

// Define the summary schema
const summarySchema: Schema = new Schema({
    id: {
        type: String,
        required: true,
    },
    owner: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        default: "A summary",
    },
    description: {
        type: String,
        default: "This is a summary",
    },
    content: {
        type: String,
        default: "Interesting summary",
    },
    views: {
        type: Number,
        default: 0,
    },
    likes: {
        type: Number,
        default: 0,
    },
    comments: {
        type: [String],
        default: [],
    },
    dateCreated: {
        type: String,
        required: true,
    },
    lastUpdated: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    tags: {
        type: [String],
        default: [],
    },
    neuronGraph: {
        type: Map,
        of: {
            term: {
                type: String,
                required: true,
            },
            definition: {
                type: String,
                required: true,
            },
            relatedTerms: {
                type: [String],
                default: [],
            },
        },
        default: {},
    },
    path: {
        type: [String],
        required: true,
    },
    isPrivate: {
        type: Boolean,
        default: false,
    },
    fileId: {
        type: String,
        required: false,
    }
});

// Export the model, checking if it already exists to avoid recompilation issues


const Summary = models.Summary || model<ISummary>("Summary", summarySchema);
export default Summary;