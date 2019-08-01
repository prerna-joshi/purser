/*
* Copyright (c) 2018 VMware Inc. All Rights Reserved.
* SPDX-License-Identifier: Apache-2.0
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
 */

package apiHandlers

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"strconv"
	"strings"

	"fmt"
	"sort"

	"github.com/Sirupsen/logrus"
	"github.com/vmware/purser/pkg/controller/dgraph/models"
	"github.com/vmware/purser/pkg/controller/utils"
	"github.com/vmware/purser/pkg/pricing"
	apps_v1beta1 "k8s.io/api/apps/v1beta1"
	"k8s.io/apimachinery/pkg/util/yaml"
)

type Pod struct {
	Name         string
	CPU          float64
	Memory       float64
	App          string
	Affinity     []string
	AntiAffinity []string
}

type Set struct {
	Score  int
	CPU    float64
	Memory float64
	Pods   []Pod
}

const GOOD = 1
const BAD = -1
const NEUTRAL = 0
const UNDEFINED = -2
const MAX_SCORE = 32
const CPU_FACTOR = 4
const MEMORY_FACTOR = 1

// GetCloudRegionList listens on /api/clouds/regions endpoint
func GetCloudRegionList(w http.ResponseWriter, r *http.Request) {
	addAccessControlHeaders(&w, r)
	logrus.Printf("Update regions")
	pricing.PopulateAllRateCards()
	logrus.Printf("All records updated")
	// encodeAndWrite(w,)
}

// CompareCloud listens on /api/clouds/compare endpoint
func CompareCloud(w http.ResponseWriter, r *http.Request) {
	addAccessControlHeaders(&w, r)
	queryParams := r.URL.Query()
	logrus.Debugf("Query params: (%v)", queryParams)

	regionData, err := convertRequestBodyToJSON(r)
	if err != nil {
		logrus.Errorf("unable to parse request as either JSON or YAML, err: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	var region []models.CloudRegion

	if jsonErr := json.Unmarshal(regionData, &region); jsonErr != nil {
		logrus.Errorf("unable to parse object as group, err: %v", jsonErr)
		http.Error(w, jsonErr.Error(), http.StatusBadRequest)
		return
	}
	logrus.Printf("region  %#v ", region)
	nodeCost := models.GetCostForClusterNodes(region)
	encodeAndWrite(w, nodeCost)
}

// InfrastructurePlanning ...
func InfrastructurePlanning(w http.ResponseWriter, r *http.Request) {
	addAccessControlHeaders(&w, r)
	var Buf bytes.Buffer
	file, _, err := r.FormFile("fileKey")
	if err != nil {
		panic(err)
	}
	defer file.Close()
	io.Copy(&Buf, file)
	contents := Buf.String()
	var deployments []apps_v1beta1.Deployment
	for _, deploymentString := range strings.Split(contents, "---\n") {
		deploymentData, err := yaml.ToJSON([]byte(deploymentString))
		if err != nil {
			logrus.Errorf("unable to parse request as either JSON or YAML, err: %v", err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		deployment := apps_v1beta1.Deployment{}
		if jsonErr := json.Unmarshal(deploymentData, &deployment); jsonErr != nil {
			logrus.Errorf("unable to parse object as deployment, err: %v", jsonErr)
			http.Error(w, jsonErr.Error(), http.StatusBadRequest)
			return
		}
		deployments = append(deployments, deployment)
	}
	fmt.Printf("MYDEBUGGG %#v\n\n\n", deployments)
	pods := listOfDeploymentsToListOfPods(deployments)
	fmt.Printf("MYDEBUGGG %#v\n\n\n", pods)
	nodes := getNodesPlanFromListOfPods(pods)
	fmt.Printf("MYDEBUGGG %#v", nodes)
	nodesRecommender := pricing.InfraPlanningService(nodes)
	encodeAndWrite(w, nodesRecommender)
	Buf.Reset()
}

func getNodesPlanFromListOfPods(pods []Pod) []models.Node {
	sets := []*Set{}
	for _, pod := range pods {
		isAdded := false
		relation := UNDEFINED
		firstPossibleIndex := UNDEFINED
		for index, set := range sets {
			relation = getPodSetRelation(*set, pod)
			if relation == GOOD {

				isAdded = true
				set.addPodToSet(pod)
				break
			}
			if firstPossibleIndex == UNDEFINED && relation == NEUTRAL && (set.Score+pod.getScore() < MAX_SCORE) {
				logrus.Printf("here-------xxx")
				firstPossibleIndex = index
			}
		}

		if !isAdded {
			if relation == UNDEFINED || firstPossibleIndex == UNDEFINED {
				set := Set{Score: 0, Pods: []Pod{}, CPU: 0.0, Memory: 0.0}
				set.addPodToSet(pod)
				sets = append(sets, &set)
			}
			if firstPossibleIndex >= 0 {
				logrus.Printf("here-------yyy")
				sets[firstPossibleIndex].addPodToSet(pod)
				// set.addPodToSet(pod)
				logrus.Printf("pod: %#v,\n set after add : %#v", pod, *sets[firstPossibleIndex])
			}
		}
		sets = sortSets(sets)
	}

	nodes := []models.Node{}
	logrus.Printf("sets: %#v", sets)
	for _, set := range sets {
		logrus.Printf("set: %#v", *set)
		node := models.Node{CPUCapacity: set.CPU, MemoryCapacity: set.Memory}
		nodes = append(nodes, node)
	}
	return nodes
}

func (s *Set) addPodToSet(pod Pod) {
	s.Score = s.Score + pod.getScore()
	s.Pods = append(s.Pods, pod)
	s.CPU = s.CPU + pod.CPU
	s.Memory = s.Memory + pod.Memory
}

func (pod Pod) getScore() int {
	return int(CPU_FACTOR*pod.CPU + MEMORY_FACTOR*pod.Memory)
}

func contains(s []string, e string) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}

func listOfDeploymentsToListOfPods(deployments []apps_v1beta1.Deployment) []Pod {
	pods := []Pod{}
	for _, deployment := range deployments {
		pods = append(pods, convertDeploymentToListOfPods(deployment)...)
	}
	return pods
}

func convertDeploymentToListOfPods(deployment apps_v1beta1.Deployment) []Pod {
	var pods []Pod
	nReplicas := int(*deployment.Spec.Replicas)
	for i := 0; i < nReplicas; i++ {
		pods = append(pods, Pod{
			Name:         deployment.ObjectMeta.Name + "-" + strconv.Itoa(i),
			App:          deployment.Spec.Template.ObjectMeta.Labels["app"],
			Affinity:     strings.Split(deployment.Spec.Template.ObjectMeta.Labels["affinity"], ","),
			AntiAffinity: append(strings.Split(deployment.Spec.Template.ObjectMeta.Labels["antiaffinity"], ","), deployment.Spec.Template.ObjectMeta.Labels["app"]),
			CPU:          utils.ConvertToFloat64CPU(deployment.Spec.Template.Spec.Containers[0].Resources.Requests.Cpu()),
			Memory:       utils.ConvertToFloat64GB(deployment.Spec.Template.Spec.Containers[0].Resources.Requests.Memory()),
		})
	}
	return pods
}

func getPodSetRelation(set Set, newPod Pod) int {
	relation := NEUTRAL
	for _, pod := range set.Pods {
		if contains(newPod.Affinity, pod.App) {
			relation = GOOD
		} else if contains(newPod.AntiAffinity, pod.App) {
			return BAD
		}
	}
	return relation
}

func sortSets(sets []*Set) []*Set {
	sort.Slice(sets, func(i, j int) bool {
		return sets[i].Score < sets[j].Score
	})
	return sets
}
