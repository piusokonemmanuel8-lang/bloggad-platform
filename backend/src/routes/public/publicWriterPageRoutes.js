const express=require('express');
const c=require('../../controllers/writerPageController');
const router=express.Router();
router.get('/health',(req,res)=>res.json({ok:true,message:'Public Writer Page routes working'}));
router.get('/writers/:writerId/primary',c.getPublicPrimaryWriterPage);
router.get('/:pageSlug/posts/:postSlug',c.getPublicWriterPagePost);
router.get('/:pageSlug',c.getPublicWriterPage);
module.exports=router;