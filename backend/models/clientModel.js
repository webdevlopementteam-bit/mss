import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true
        },
        image:{
            type:String,
            required:true
        }
    }
);

export default mongoose.model("Client",clientSchema);