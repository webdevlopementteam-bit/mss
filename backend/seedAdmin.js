import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/userModel.js";

dotenv.config();

// 👇 Yahan apna admin email/password daal ke edit karo, phir `npm run seed-admin` chalao
const ADMIN_CREDENTIALS = {
  name: "Super Admin",
  email: "admin@example.com",
  password: "Admin@123",
};

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await User.findOne({
      email: ADMIN_CREDENTIALS.email,
    });

    const hashedPassword = await bcrypt.hash(
      ADMIN_CREDENTIALS.password,
      10
    );

    const ADMIN_PERMISSIONS = [
      "create_admin",
      "manage_users",
      "manage_products",
      "manage_orders",
      "user_view",
      "user_update",
      "user_delete",
    ];

    if (existingAdmin) {
      existingAdmin.name = ADMIN_CREDENTIALS.name;
      existingAdmin.password = hashedPassword;
      existingAdmin.role = "admin";
      existingAdmin.isActive = true;
      existingAdmin.permissions = ADMIN_PERMISSIONS;

      await existingAdmin.save();

      console.log("Admin already existed, password updated");
    } else {
      await User.create({
        name: ADMIN_CREDENTIALS.name,
        email: ADMIN_CREDENTIALS.email,
        password: hashedPassword,
        role: "admin",
        isActive: true,
        permissions: ADMIN_PERMISSIONS,
      });

      console.log("Admin created successfully");
    }

    console.log({
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password,
    });

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();
