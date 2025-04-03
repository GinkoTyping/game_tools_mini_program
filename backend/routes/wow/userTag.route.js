import express from 'express';
import {
  queryAddUserTag,
  queryFilterDetails,
  queryUserTagByFilter,
  queryUpdateUserTag,
  queryUserTagByIds,
  queryUserTagOptions,
  queryUpdateLastViewRelation,
  queryNotViewedRelations,
} from '../../controller/wow/userTag.controller.js';
import {
  queryAddRelationStatusByApplicantId,
  queryRelationByApplicantUserId,
  queryRelationByTargetUserId,
} from '../../controller/wow/userTagRelation.controller.js';
const router = express.Router();

router.post('/user-tag/options', queryUserTagOptions);
router.post('/user-tag/add', queryAddUserTag);
router.post('/user-tag/update', queryUpdateUserTag);
router.post('/user-tag/query', queryUserTagByIds);
router.post('/user-tag/list', queryUserTagByFilter);
router.post('/user-tag/filters', queryFilterDetails);
router.post('/user-tag/update-view-relation', queryUpdateLastViewRelation);
router.post('/user-tag/get-view-relation', queryNotViewedRelations);

router.post('/user-tag/relation/applicant', queryRelationByApplicantUserId);
router.post('/user-tag/relation/target', queryRelationByTargetUserId);
router.post('/user-tag/relation/add', queryAddRelationStatusByApplicantId);

export default router;
