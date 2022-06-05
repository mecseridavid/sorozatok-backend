import csv

titles = []
title_list = []
episode_list = []

with open("lista.txt", "r") as textFile:
    title_list.append(["_id", "title", "img", "episodes"])
    for i, title in enumerate(textFile.read().splitlines()):
        if i % 5 == 1 and title not in titles:
            titles.append(title)

for i, title in enumerate(titles):
    title_list.append([i + 1, title, "", []])

episode_counter = 1
with open("lista.txt", "r") as textFile:
    episode_list.append(["_id", "date", "title", "season", "episode", "duration", "watched"])
    seriesData = [episode_counter]
    for i, sor in enumerate(textFile.read().splitlines()):
        if i % 5 == 0:
            if sor == "NI":
                seriesData.append(None)
            else:
                seriesData.append(sor)
        if i % 5 == 1:
            for (idx, title, img, episodes) in title_list[1:]:
                if title == sor:
                    seriesData.append(int(idx))
                    episodes.append(episode_counter)
        if i % 5 == 2:
            data = sor.split("x")
            seriesData.append(int(data[0]))
            seriesData.append(int(data[1]))
        if i % 5 == 3:
            seriesData.append(int(sor))
        if i % 5 == 4:
            seriesData.append(int(sor))
            episode_counter += 1
            episode_list.append(seriesData)
            seriesData = [episode_counter]

with open('titles.csv', "w", newline='') as file:
    writer = csv.writer(file)
    writer.writerows(title_list)
#
with open('episodes.csv', "w", newline='') as file:
    writer = csv.writer(file)
    writer.writerows(episode_list)
