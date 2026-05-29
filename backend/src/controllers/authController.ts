import { Request, Response } from "express";
import { z } from "zod";
import { userService } from "../services/userService";
import { stripeService } from "../services/stripeService";
import { serializeMemberForClient } from "../lib/serializeUser";
import { signInByCredentials } from "../services/signInService";
import {
  PasswordResetAccountNotFoundError,
  passwordResetService,
} from "../services/passwordResetService";

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const verifyResetCodeSchema = z.object({
  email: z.string().email(),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Code must be 6 digits"),
});

const resetPasswordSchema = z.object({
  resetToken: z.string().min(1),
  password: z.string().min(8),
});

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const payload = registerSchema.parse(req.body);
      const { user, token } = await userService.register(payload);
      await stripeService.ensureCustomer(user._id.toString());
      return res.status(201).json({ user, token });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },
  async login(req: Request, res: Response) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await signInByCredentials(email, password);
      if (result.role === "member") {
        return res.json({
          user: await serializeMemberForClient(result.user),
          token: result.token,
          role: result.role,
          redirect: "/dashboard",
        });
      }

      const adminRedirect =
        result.role === "handicapper" ? "/admin/picks" : "/admin";

      return res.json({
        admin: result.admin,
        token: result.token,
        role: result.role,
        redirect: adminRedirect,
      });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },
  async me(req: Request, res: Response) {
    return res.json({ user: await serializeMemberForClient(req.user!) });
  },
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      const result = await passwordResetService.requestCode(email);
      return res.json(result);
    } catch (error) {
      if (error instanceof PasswordResetAccountNotFoundError) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(400).json({ error: (error as Error).message });
    }
  },
  async verifyResetCode(req: Request, res: Response) {
    try {
      const body = verifyResetCodeSchema.parse(req.body);
      const result = await passwordResetService.verifyCode(body.email, body.code);
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },
  async resetPassword(req: Request, res: Response) {
    try {
      const { resetToken, password } = resetPasswordSchema.parse(req.body);
      const result = await passwordResetService.resetPassword(resetToken, password);
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  },
};
