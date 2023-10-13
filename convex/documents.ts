import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const archive = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if(!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const doc = await ctx.db.get(args.id);
    if(!doc) {
      throw new Error("Not found");
    }

    if(doc.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const recArchive = async (documentId: Id<"documents">) => {
      const children = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) => (
          q
            .eq("userId", userId)
            .eq("parentDocument", documentId)
        ))
        .collect();

        for(const child of children) {
          await ctx.db.patch(child._id, {
            isArchived: true
          });
          await recArchive(child._id);
        }
    }

    const archivedDoc = await ctx.db.patch(args.id, {
      isArchived: true
    });

    recArchive(args.id);

    return archivedDoc;
  }
})

export const getSidebar = query({
  args: {
    parentDocument: v.optional(v.id("documents"))
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if(!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const documents = await ctx.db
    .query("documents")
    .withIndex("by_user_parent", (q) =>
      q
      .eq("userId", userId)
      .eq("parentDocument", args.parentDocument)
    )
    .filter((q) => 
      q.eq(q.field("isArchived"), false)
    )
    .order("desc")
    .collect();

    return documents;
  }
});

export const create = mutation({
  args: {
    title: v.string(),
    parentDocument: v.optional(v.id("documents"))
  },
  handler: async(ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if(!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const document = await ctx.db.insert("documents", {
      title: args.title,
      parentDocument: args.parentDocument,
      userId,
      isArchived: false,
      isPublished: false
    });

    return document;
  }
})