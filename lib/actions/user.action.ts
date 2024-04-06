"use server"

import User from "@/database/user.model";
import { connectToDataBase } from "../mongoose"
import { CreateUserParams, DeleteUserParams, UpdateUserParams } from "./shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";

export async function getUserById(params: any){
  try {
    connectToDataBase();

    const {userId} = params;
    
    const user = await User.findOne({clerkId: userId});
    return user;
  } catch (error) {
    console.log(error);
  }
}


export async function createUser(userData: CreateUserParams){
  try {
    connectToDataBase();

    const newUser = await User.create(userData)
    return newUser;
  } catch (error) {
    console.log(error);
  }
}

export async function updateUser(params: UpdateUserParams){
  try {
    connectToDataBase();

    const {clerkId, updateData, path} = params;

    await User.findOneAndUpdate({clerkId}, updateData, {new: true});
    
    revalidatePath(path)
  } catch (error) {
    console.log(error);
  }
}

export async function deleteUser(params: DeleteUserParams){
  try {
    connectToDataBase();

    const {clerkId} = params;
    
    const user = await User.findOneAndDelete({clerkId})

    if(!user){
      throw new Error('User not found.')
    }

    // delete user from database
    //and its question, comments, answers... 

    // get user question  id's
    const userQuestionIds = await Question.find({author: user._id}).distinct('_id');
    // delete user questions
    await Question.deleteMany({author: user._id});
    // delete user answer

    // return delete user
    const deletedUser = await User.findByIdAndDelete(user._id); 
    return deleteUser;

  } catch (error) {
    console.log(error);
  }
}