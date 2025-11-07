import GeneratorPanel from '@/components/GeneratorPanel.vue';
import { useImageStore } from '@/stores/imageStore';
const imageStore = useImageStore();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['generated-image-item']} */ ;
/** @type {__VLS_StyleScopedClasses['generated-image-item']} */ ;
/** @type {__VLS_StyleScopedClasses['generated-image-item']} */ ;
/** @type {__VLS_StyleScopedClasses['image-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['image-action-btn']} */ ;
__VLS_asFunctionalElement(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    id: "generator",
    ...{ class: "section-padding" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "container mx-auto max-w-5xl" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid grid-cols-1 lg:grid-cols-2 gap-8" },
});
/** @type {[typeof GeneratorPanel, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(GeneratorPanel, new GeneratorPanel({}));
const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "right-column" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "text-3xl font-bold mb-6" },
});
__VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "card h-full" },
});
if (__VLS_ctx.imageStore.isGenerating) {
    // @ts-ignore
    [imageStore,];
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "text-center py-8" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsics.i, __VLS_intrinsics.i)({
        ...{ class: "fa fa-spinner fa-spin text-purple-light text-5xl mb-4" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-gray-400" },
    });
}
else if (__VLS_ctx.imageStore.generatedImages.length > 0) {
    // @ts-ignore
    [imageStore,];
    __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        id: "generatedImages",
    });
    for (const [image] of __VLS_getVForSourceType((__VLS_ctx.imageStore.generatedImages))) {
        // @ts-ignore
        [imageStore,];
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "generated-image-item" },
            key: (image.id),
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.img)({
            src: (image.url),
            alt: "AI生成图像",
            loading: "lazy",
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "image-actions" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.imageStore.isGenerating))
                        return;
                    if (!(__VLS_ctx.imageStore.generatedImages.length > 0))
                        return;
                    __VLS_ctx.imageStore.downloadImage(image.url);
                    // @ts-ignore
                    [imageStore,];
                } },
            ...{ class: "image-action-btn" },
            title: "下载",
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "fa fa-download" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.imageStore.generateImage) },
            ...{ class: "image-action-btn" },
            title: "重新生成",
        });
        // @ts-ignore
        [imageStore,];
        __VLS_asFunctionalElement(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "fa fa-refresh" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.imageStore.isGenerating))
                        return;
                    if (!(__VLS_ctx.imageStore.generatedImages.length > 0))
                        return;
                    __VLS_ctx.imageStore.deleteImage(image.id);
                    // @ts-ignore
                    [imageStore,];
                } },
            ...{ class: "image-action-btn" },
            title: "删除",
        });
        __VLS_asFunctionalElement(__VLS_intrinsics.i, __VLS_intrinsics.i)({
            ...{ class: "fa fa-trash" },
        });
    }
}
/** @type {__VLS_StyleScopedClasses['section-padding']} */ ;
/** @type {__VLS_StyleScopedClasses['container']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-5xl']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-8']} */ ;
/** @type {__VLS_StyleScopedClasses['right-column']} */ ;
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['py-8']} */ ;
/** @type {__VLS_StyleScopedClasses['fa']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-spin']} */ ;
/** @type {__VLS_StyleScopedClasses['text-purple-light']} */ ;
/** @type {__VLS_StyleScopedClasses['text-5xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['generated-image-item']} */ ;
/** @type {__VLS_StyleScopedClasses['image-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['image-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['fa']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-download']} */ ;
/** @type {__VLS_StyleScopedClasses['image-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['fa']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-refresh']} */ ;
/** @type {__VLS_StyleScopedClasses['image-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['fa']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-trash']} */ ;
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
