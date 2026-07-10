import mongoose from "mongoose";

const awardSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true,
        },
        image:{
            type:String,
            required:true
        }
    },
    {
        timestamps:true,
    }
);

export default mongoose.model("Award",awardSchema);