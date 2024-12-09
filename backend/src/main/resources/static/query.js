const base = {
    "operationName": "Poe2StaticDataQuery",
    "variables": {


        "passiveSkillsFilter": {
            "page": {
                "all": true
            }
        },
        "gemsFilter": {
            "page": {
                "all": true
            }
        },

        "equipmentRestrictionsFilter": {
            "page": {
                "all": true
            }
        },
        "charactersFilter": {
            "page": {
                "all": true
            }
        },
        "passiveSkillsGraphFilter": {
            "page": {
                "all": true
            }
        },
        "equipmentGemsFilter": {
            "page": {
                "all": true
            }
        },
        "passiveSkillTreeRestrictionsFilter": {
            "page": {
                "all": true
            }
        }
    },
    "query": "query Poe2StaticDataQuery($passiveSkillsFilter: Poe2PassiveSkillsFilter, $gemsFilter: Poe2GemsFilter, $charactersFilter: Poe2CharactersFilter, $passiveSkillsGraphFilter: Poe2PassiveSkillsGraphFilter, $passiveSkillTreeRestrictionsFilter: Poe2PassiveSkillTreeRestrictionsFilter) {\n" +
        "  game: poe2 {\n" +
        "    staticData {\n" +
        "      poe2Gems(filter: $gemsFilter) {\n" +
        "        data {\n" +
        "          ...Poe2StaticDataGemsFragment\n" +
        "          __typename\n" +
        "        }\n" +
        "        __typename\n" +
        "      }\n" +
        "      poe2Characters(filter: $charactersFilter) {\n" +
        "        data {\n" +
        "          ...Poe2StaticDataCharactersFragment\n" +
        "          __typename\n" +
        "        }\n" +
        "        __typename\n" +
        "      }\n" +
        "      poe2PassiveSkills(filter: $passiveSkillsFilter) {\n" +
        "        data {\n" +
        "          ...Poe2StaticDataPassiveSkillsFragment\n" +
        "          __typename\n" +
        "        }\n" +
        "        __typename\n" +
        "      }\n" +
        "      poe2PassiveSkillsGraph(filter: $passiveSkillsGraphFilter) {\n" +
        "        data {\n" +
        "          ...Poe2StaticDataPassiveSkillsGraphFragment\n" +
        "          __typename\n" +
        "        }\n" +
        "        __typename\n" +
        "      }\n" +
        "      poe2PassiveSkillTreeRestrictions(filter: $passiveSkillTreeRestrictionsFilter) {\n" +
        "        data {\n" +
        "          ...Poe2StaticDataSkillTreeRestrictionsFragment\n" +
        "          __typename\n" +
        "        }\n" +
        "        __typename\n" +
        "      }\n" +
        "      __typename\n" +
        "    }\n" +
        "    __typename\n" +
        "  }\n" +
        "}\n" +
        "\n" +








        "fragment Poe2StaticDataGemsFragment on Poe2Gem {\n" +
        "  id\n" +
        "  isSupport\n" +
        "  mainDescription\n" +
        "  name\n" +
        "  slug\n" +
        "  icon\n" +
        "  bakedDescriptions\n" +
        "  isWeaponGranted\n" +
        "  gemsTags {\n" +
        "    slug\n" +
        "    name\n" +
        "    backedName\n" +
        "    __typename\n" +
        "  }\n" +
        "  weaponRestrictions {\n" +
        "    name\n" +
        "    slug\n" +
        "    __typename\n" +
        "  }\n" +
        "  statsPerLevel {\n" +
        "    bakedDescriptions\n" +
        "    skillLevelStats {\n" +
        "      value\n" +
        "      slug\n" +
        "      __typename\n" +
        "    }\n" +
        "    __typename\n" +
        "  }\n" +
        "  baseItem {\n" +
        "    slug\n" +
        "    icon\n" +
        "    itemClass {\n" +
        "      name\n" +
        "      slug\n" +
        "      __typename\n" +
        "    }\n" +
        "    __typename\n" +
        "  }\n" +
        "  __typename\n" +
        "}\n" +
        "\n" +
        "fragment Poe2StaticDataCharactersFragment on Poe2Character {\n" +
        "  name\n" +
        "  slug\n" +
        "  startingNodeSlug\n" +
        "  __typename\n" +
        "}\n" +
        "\n" +
        "fragment Poe2StaticDataPassiveSkillsFragment on Poe2PassiveSkill {\n" +
        "  slug\n" +
        "  name\n" +
        "  icon\n" +
        "  masteryBackgroundImage\n" +
        "  flavourText\n" +
        "  keystone\n" +
        "  notable\n" +
        "  jewelSocket\n" +
        "  character\n" +
        "  justIcon\n" +
        "  bakedDescriptions\n" +
        "  ascendancy\n" +
        "  __typename\n" +
        "}\n" +
        "\n" +
        "fragment Poe2StaticDataPassiveSkillsGraphFragment on Poe2PassiveSkillsGraph {\n" +
        "  orbits\n" +
        "  radii\n" +
        "  rootEdgeSlugs\n" +
        "  groups {\n" +
        "    slug\n" +
        "    centerX\n" +
        "    centerY\n" +
        "    nodes {\n" +
        "      slug\n" +
        "      orbit\n" +
        "      orbitIndex\n" +
        "      passiveSlug\n" +
        "      edgeSlugs\n" +
        "      edges2\n" +
        "      __typename\n" +
        "    }\n" +
        "    __typename\n" +
        "  }\n" +
        "  __typename\n" +
        "}\n" +
        "\n" +
        "fragment Poe2StaticDataSkillTreeRestrictionsFragment on Poe2PassiveSkillTreeRestriction {\n" +
        "  slug\n" +
        "  limit\n" +
        "  __typename\n" +
        "}\n" +
        "\n"
}


fetch("https://mobalytics.gg/api/poe-2/v1/graphql/query", {
    "headers": {
        "accept": "*/*",
        "accept-language": "en_us",
        "cache-control": "no-cache",
        "content-type": "application/json",
        "pragma": "no-cache",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-moba-client": "mobalytics-web",
        "x-moba-proxy-gql-ops-name": "Poe2StaticDataQuery"
    },
    "referrer": "https://mobalytics.gg/poe-2/builds/life-stacker-infernalist-kripp?weaponSet=set1",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": JSON.stringify(base),
    "method": "POST",
    "mode": "cors",
    "credentials": "include"
});


let b = [];

a = a.filter(item => {
    if (b.includes(item.name)) {
        return false;
    }

    b.push(item.name)
    return true;
})