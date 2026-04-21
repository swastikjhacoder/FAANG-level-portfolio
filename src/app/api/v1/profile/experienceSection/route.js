import { NextResponse } from "next/server";
import connectDB from "@/shared/lib/db";

import { sanitizeInput } from "@/shared/security/sanitizers/input.sanitizer";
import { withCsrf } from "@/shared/security/middleware/csrf.middleware";
import withRateLimit from "@/shared/security/middleware/rateLimit.middleware";

import { AddExperienceSectionDTO } from "@/modules/profile/application/dto/addExperienceSection.dto";
import { ExperienceSectionModel } from "@/modules/profile/infrastructure/persistence/experienceSection.schema";

export const POST = withRateLimit(
  withCsrf(async (req) => {
    try {
      await connectDB();

      const body = sanitizeInput(await req.json());

      const dto = new AddExperienceSectionDTO(body);
      dto.validate();

      const existing = await ExperienceSectionModel.findOne();

      let result;

      if (existing) {
        result = await ExperienceSectionModel.findByIdAndUpdate(
          existing._id,
          dto,
          { new: true },
        );
      } else {
        result = await ExperienceSectionModel.create(dto);
      }

      return NextResponse.json({
        success: true,
        data: result,
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 },
      );
    }
  }),
  {
    limit: 1000,
    window: 60,
    prefix: "experience-section-create",
  },
);

export async function GET() {
  try {
    await connectDB();

    let section = await ExperienceSectionModel.findOne();

    if (!section) {
      section = {
        heading: "Experience",
        subHeading: "My professional journey",
        description: "",
      };
    }

    return NextResponse.json({
      success: true,
      data: section,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}

export const PATCH = withRateLimit(
  withCsrf(async (req) => {
    try {
      await connectDB();

      const body = sanitizeInput(await req.json());

      const updateFields = {};

      if (body.heading !== undefined) updateFields.heading = body.heading;
      if (body.subHeading !== undefined)
        updateFields.subHeading = body.subHeading;
      if (body.description !== undefined)
        updateFields.description = body.description;

      if (Object.keys(updateFields).length === 0) {
        return NextResponse.json(
          { message: "No valid fields provided for update" },
          { status: 400 },
        );
      }

      let section = await ExperienceSectionModel.findOne();

      if (!section) {
        section = await ExperienceSectionModel.create(updateFields);
      } else {
        section = await ExperienceSectionModel.findByIdAndUpdate(
          section._id,
          { $set: updateFields },
          { new: true, runValidators: true },
        );
      }

      return NextResponse.json({
        success: true,
        data: section,
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 },
      );
    }
  }),
  {
    limit: 1000,
    window: 60,
    prefix: "experience-section-update",
  },
);